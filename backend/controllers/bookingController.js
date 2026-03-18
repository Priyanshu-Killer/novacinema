const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Lock seats (called when user selects seats)
exports.lockSeats = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body; // seats: [{row, seatNumber}]
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const show = await Show.findById(showId).session(session);
    if (!show) throw new Error('Show not found');

    // Release expired locks first
    show.releaseExpiredLocks();

    const unavailable = [];
    seats.forEach(({ row, seatNumber }) => {
      const seat = show.seats.find(s => s.row === row && s.seatNumber === seatNumber);
      if (!seat || seat.status !== 'available') {
        unavailable.push(`${row}${seatNumber}`);
      }
    });

    if (unavailable.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: `Seats not available: ${unavailable.join(', ')}` });
    }

    // Lock the seats
    seats.forEach(({ row, seatNumber }) => {
      const seat = show.seats.find(s => s.row === row && s.seatNumber === seatNumber);
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedAt = new Date();
    });

    show.availableSeats = show.seats.filter(s => s.status === 'available').length;
    await show.save({ session });
    await session.commitTransaction();

    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seatUpdate', {
        showId,
        updatedSeats: seats.map(s => ({ ...s, status: 'locked' }))
      });
    }

    res.json({ success: true, message: 'Seats locked for 10 minutes', lockedSeats: seats });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

// Create booking after payment
exports.createBooking = asyncHandler(async (req, res) => {
  const { showId, seats, paymentDetails } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const show = await Show.findById(showId).populate('movie theatre').session(session);
    if (!show) throw new Error('Show not found');

    // Verify seats are locked by this user
    const seatDetails = [];
    let totalAmount = 0;

    for (const { row, seatNumber } of seats) {
      const seat = show.seats.find(s => s.row === row && s.seatNumber === seatNumber);
      if (!seat || seat.status !== 'locked' || String(seat.lockedBy) !== String(userId)) {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: `Seat ${row}${seatNumber} is not locked by you` });
      }
      seatDetails.push({ row, seatNumber, seatType: seat.seatType, price: seat.price });
      totalAmount += seat.price;
    }

    const convenienceFee = Math.round(totalAmount * 0.05);
    const finalAmount = totalAmount + convenienceFee;

    // Create booking
    const booking = new Booking({
      user: userId,
      show: showId,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: seatDetails,
      totalAmount,
      convenienceFee,
      finalAmount,
      status: 'confirmed',
      paymentStatus: 'completed',
      showDate: show.showDate.toDateString(),
      showTime: show.showTime
    });

    // Generate QR code
    const qrData = JSON.stringify({ bookingId: booking.bookingId, seats: seatDetails.map(s => `${s.row}${s.seatNumber}`) });
    booking.qrCode = await QRCode.toDataURL(qrData);

    await booking.save({ session });

    // Create payment record
    const payment = await Payment.create([{
      booking: booking._id,
      user: userId,
      amount: finalAmount,
      method: paymentDetails?.method || 'card',
      status: 'completed',
      gatewayResponse: { ...paymentDetails, simulatedAt: new Date() }
    }], { session });

    booking.paymentId = payment[0]._id;
    await booking.save({ session });

    // Mark seats as booked
    seats.forEach(({ row, seatNumber }) => {
      const seat = show.seats.find(s => s.row === row && s.seatNumber === seatNumber);
      seat.status = 'booked';
      seat.bookedBy = booking._id;
      seat.lockedBy = null;
      seat.lockedAt = null;
    });

    show.availableSeats = show.seats.filter(s => s.status === 'available').length;
    await show.save({ session });

    await session.commitTransaction();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${showId}`).emit('seatUpdate', {
        showId,
        updatedSeats: seats.map(s => ({ ...s, status: 'booked' }))
      });
    }

    const populatedBooking = await Booking.findById(booking._id).populate('movie theatre show');
    res.status(201).json({ success: true, message: 'Booking confirmed!', booking: populatedBooking });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

exports.getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('movie theatre')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate('movie theatre');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status === 'cancelled') return res.status(400).json({ success: false, message: 'Booking already cancelled' });

  booking.status = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.save();

  // Release seats
  const show = await Show.findById(booking.show);
  if (show) {
    booking.seats.forEach(({ row, seatNumber }) => {
      const seat = show.seats.find(s => s.row === row && s.seatNumber === seatNumber);
      if (seat) { seat.status = 'available'; seat.bookedBy = null; }
    });
    show.availableSeats = show.seats.filter(s => s.status === 'available').length;
    await show.save();
  }

  res.json({ success: true, message: 'Booking cancelled and refund initiated' });
});
