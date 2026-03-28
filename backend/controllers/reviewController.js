const mongoose = require('mongoose')
const Review   = require('../models/Review')
const Movie    = require('../models/Movie')
const { asyncHandler } = require('../middleware/errorMiddleware')

const updateMovieRating = async (movieId) => {
  try {
    const result = await Review.aggregate([
      { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const avg   = result[0]?.avgRating || 0
    const count = result[0]?.count || 0
    await Movie.findByIdAndUpdate(movieId, {
      imdbRating:  Math.round(avg * 10) / 10,
      reviewCount: count
    })
  } catch (err) {
    console.error('updateMovieRating error:', err.message)
  }
}

exports.createReview = asyncHandler(async (req, res) => {
  const { movieId, rating, title, body } = req.body

  if (!movieId)  return res.status(400).json({ success: false, message: 'movieId is required' })
  if (!rating)   return res.status(400).json({ success: false, message: 'Rating is required' })
  if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' })

  const movie = await Movie.findById(movieId)
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' })

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, movie: movieId },
    { rating: Number(rating), title: title || '', body: body || '' },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
  await review.populate('user', 'name')
  await updateMovieRating(movieId)

  res.status(201).json({ success: true, message: 'Review saved!', review })
})

exports.getMovieReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [reviews, total] = await Promise.all([
    Review.find({ movie: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Review.countDocuments({ movie: req.params.movieId })
  ])

  let distribution = { 1:0, 2:0, 3:0, 4:0, 5:0 }
  let avgRating = 0

  try {
    const dist = await Review.aggregate([
      { $match: { movie: new mongoose.Types.ObjectId(req.params.movieId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ])
    dist.forEach(d => { distribution[d._id] = d.count })

    const avgRes = await Review.aggregate([
      { $match: { movie: new mongoose.Types.ObjectId(req.params.movieId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ])
    avgRating = avgRes[0]?.avg ? Math.round(avgRes[0].avg * 10) / 10 : 0
  } catch {}

  res.json({ success: true, reviews, total, avgRating, distribution })
})

exports.getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ user: req.user._id, movie: req.params.movieId })
  res.json({ success: true, review: review || null })
})

exports.likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })

  const alreadyLiked = review.likedBy.includes(req.user._id)
  if (alreadyLiked) {
    review.likedBy.pull(req.user._id)
    review.likes = Math.max(0, review.likes - 1)
  } else {
    review.likedBy.push(req.user._id)
    review.likes += 1
  }
  await review.save()
  res.json({ success: true, likes: review.likes, liked: !alreadyLiked })
})

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' })

  const movieId = review.movie
  await review.deleteOne()
  await updateMovieRating(movieId)
  res.json({ success: true, message: 'Review deleted' })
})