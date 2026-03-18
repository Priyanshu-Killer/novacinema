const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, getAllBookings } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/bookings', getAllBookings);

module.exports = router;
