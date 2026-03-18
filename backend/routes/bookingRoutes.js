const express = require('express');
const router = express.Router();
const { lockSeats, createBooking, getUserBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/lock-seats', lockSeats);
router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
