const express = require('express')
const router  = express.Router()
const { createReview, getMovieReviews, getMyReview, likeReview, deleteReview } = require('../controllers/reviewController')
const { protect } = require('../middleware/authMiddleware')

router.post('/',                    protect, createReview)
router.get('/:movieId',                      getMovieReviews)
router.get('/:movieId/my',          protect, getMyReview)
router.post('/:id/like',            protect, likeReview)
router.delete('/:id',               protect, deleteReview)

module.exports = router