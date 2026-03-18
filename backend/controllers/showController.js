const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Generate seat layout from theatre screen
const generateSeats = (screen, pricing) => {
  const seats = [];
  const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  if (screen && screen.seatLayout && screen.seatLayout.length > 0) {
    screen.seatLayout.forEach(rowData => {
      rowData.seats.forEach(seat => {
        if (seat.isAvailable) {
          seats.push({
            row: rowData.row,
            seatNumber: seat.number,
            seatType: seat.type || 'standard',
            price: pricing[seat.type] || pricing.standard,
            status: 'available'
          });
        }
      });
    });
  } else {
    // Default: generate rows A-J, 10 seats each
    for (let r = 0; r < 10; r++) {
      for (let s = 1; s <= 10; s++) {
        const type = r < 3 ? 'recliner' : r < 6 ? 'premium' : 'standard';
        seats.push({
          row: rows[r],
          seatNumber: s,
          seatType: type,
          price: pricing[type] || pricing.standard,
          status: 'available'
        });
      }
    }
  }
  return seats;
};

exports.createShow = asyncHandler(async (req, res) => {
  const { movie, theatre, screen, showDate, showTime, pricing, language, format } = req.body;
  
  const theatreDoc = await Theatre.findById(theatre);
  if (!theatreDoc) return res.status(404).json({ success: false, message: 'Theatre not found' });

  const screenDoc = theatreDoc.screens.find(s => s.name === screen);
  const seats = generateSeats(screenDoc, pricing || { standard: 200, premium: 350, recliner: 500 });
  
  const show = await Show.create({
    movie, theatre, screen, showDate, showTime, language, format,
    pricing: pricing || { standard: 200, premium: 350, recliner: 500 },
    seats,
    totalSeats: seats.length,
    availableSeats: seats.length
  });

  res.status(201).json({ success: true, message: 'Show created', show });
});

exports.getShowsByMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { date, city } = req.query;
  
  const dateFilter = date ? new Date(date) : new Date();
  const startOfDay = new Date(dateFilter.setHours(0, 0, 0, 0));
  const endOfDay = new Date(dateFilter.setHours(23, 59, 59, 999));

  const shows = await Show.find({
    movie: movieId,
    showDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'ongoing'] }
  }).populate('theatre').sort({ showTime: 1 });

  // Filter by city if provided
  const filteredShows = city 
    ? shows.filter(s => s.theatre.address.city.toLowerCase().includes(city.toLowerCase()))
    : shows;

  res.json({ success: true, shows: filteredShows });
});

exports.getShowById = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id).populate('movie theatre');
  if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
  
  // Release expired seat locks
  if (show.releaseExpiredLocks()) await show.save();
  
  res.json({ success: true, show });
});

exports.getAllShows = asyncHandler(async (req, res) => {
  const shows = await Show.find().populate('movie theatre').sort({ showDate: -1 }).limit(100);
  res.json({ success: true, shows });
});

exports.updateShow = asyncHandler(async (req, res) => {
  const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
  res.json({ success: true, show });
});

exports.deleteShow = asyncHandler(async (req, res) => {
  await Show.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.json({ success: true, message: 'Show cancelled' });
});
