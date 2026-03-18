const mongoose = require('mongoose')

const castMemberSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    role:     { type: String, trim: true, default: '' },
    photoUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const movieSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genre:       { type: [String], default: [] },
    language:    { type: String, default: 'English' },
    duration:    { type: Number, required: true },
    releaseDate: { type: Date },
    rating:      { type: String, enum: ['U', 'UA', 'A', 'S'], default: 'UA' },
    posterUrl:   { type: String, default: '' },
    trailerUrl:  { type: String, default: '' },
    director:    { type: String, default: '' },
    status:      { type: String, enum: ['upcoming', 'now_showing', 'ended'], default: 'upcoming' },
    cast:        { type: [castMemberSchema], default: [] },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
)

movieSchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.model('Movie', movieSchema)