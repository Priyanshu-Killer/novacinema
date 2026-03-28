const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie:   { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true, maxlength: 100, default: '' },
  body:    { type: String, trim: true, maxlength: 1000, default: '' },
  likes:   { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

// One review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)