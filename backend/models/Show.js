const mongoose = require('mongoose');

const showSeatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  seatType: { type: String, enum: ['standard', 'premium', 'recliner', 'disabled'], default: 'standard' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lockedAt: { type: Date, default: null },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
});

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  screen: { type: String, required: true }, // screen name
  showDate: { type: Date, required: true },
  showTime: { type: String, required: true }, // "14:30"
  endTime: { type: String },
  seats: [showSeatSchema],
  pricing: {
    standard: { type: Number, default: 200 },
    premium: { type: Number, default: 350 },
    recliner: { type: Number, default: 500 }
  },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
  language: { type: String, default: 'English' },
  format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  totalSeats: { type: Number },
  availableSeats: { type: Number }
}, { timestamps: true });

showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theatre: 1, showDate: 1 });
showSchema.index({ showDate: 1, status: 1 });

// Auto-release locked seats after timeout
showSchema.methods.releaseExpiredLocks = function() {
  const timeout = parseInt(process.env.SEAT_LOCK_TIMEOUT) || 600000; // 10 minutes
  const now = new Date();
  let released = false;
  this.seats.forEach(seat => {
    if (seat.status === 'locked' && seat.lockedAt && (now - seat.lockedAt) > timeout) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockedAt = null;
      released = true;
    }
  });
  return released;
};

module.exports = mongoose.model('Show', showSchema);
