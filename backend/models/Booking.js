const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, default: () => `NC-${uuidv4().slice(0, 8).toUpperCase()}` },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  seats: [{
    row: String,
    seatNumber: Number,
    seatType: String,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  convenienceFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  qrCode: { type: String }, // base64 QR
  showDate: { type: String },
  showTime: { type: String }
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
// Note: bookingId index is already created by unique:true in the schema field definition
// No need for a separate bookingSchema.index({ bookingId: 1 })
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);