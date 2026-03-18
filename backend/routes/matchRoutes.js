const express = require('express')
const router  = express.Router()
const {
  getAllMatches, getMatchById, createMatch, updateMatch, deleteMatch,
  bookMatch, getMyMatchBookings, getMatchBookingById
} = require('../controllers/matchController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// Public
router.get('/',    getAllMatches)
router.get('/:id', getMatchById)

// Auth
router.post('/:id/book',    protect, bookMatch)
router.get('/bookings/my',  protect, getMyMatchBookings)
router.get('/bookings/:id', protect, getMatchBookingById)

// Admin
router.post('/',    protect, adminOnly, createMatch)
router.put('/:id',  protect, adminOnly, updateMatch)
router.delete('/:id', protect, adminOnly, deleteMatch)

module.exports = router