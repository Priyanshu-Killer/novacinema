const mongoose = require('mongoose')

const matchBookingSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  match:       { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  bookingNumber: { type: String, unique: true },
  tickets: [{
    category:  { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
  status:      { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true })

matchBookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('MatchBooking').countDocuments()
    this.bookingNumber = `MB-${String(count + 1).padStart(5, '0')}`
  }
  next()
})

module.exports = mongoose.model('MatchBooking', matchBookingSchema)