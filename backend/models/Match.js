const mongoose = require('mongoose')

const ticketCategorySchema = new mongoose.Schema({
  name:      { type: String, required: true }, // General, VIP, Premium
  price:     { type: Number, required: true },
  totalSeats:{ type: Number, required: true },
  bookedSeats:{ type: Number, default: 0 },
  color:     { type: String, default: '#6633d4' },
}, { _id: false })

const matchSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true }, // e.g. "India vs Australia"
  sport:       { type: String, default: 'Cricket' },
  team1:       { type: String, required: true },
  team2:       { type: String, required: true },
  team1Logo:   { type: String, default: '' },
  team2Logo:   { type: String, default: '' },
  venue:       { type: String, required: true },
  city:        { type: String, default: '' },
  matchDate:   { type: Date, required: true },
  matchTime:   { type: String, required: true }, // "14:30"
  format:      { type: String, default: 'T20' }, // T20, ODI, Test, IPL
  description: { type: String, default: '' },
  bannerUrl:   { type: String, default: '' },
  status:      { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  ticketCategories: { type: [ticketCategorySchema], default: [] },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Match', matchSchema)