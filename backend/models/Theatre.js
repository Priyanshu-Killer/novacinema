const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  seatLayout: [{
    row: String,
    seats: [{
      number: Number,
      type: { type: String, enum: ['standard', 'premium', 'recliner', 'disabled'], default: 'standard' },
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  amenities: [String]
});

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  phone: String,
  email: String,
  screens: [screenSchema],
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

theatreSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
