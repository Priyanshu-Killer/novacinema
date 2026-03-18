// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, registerAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register-admin', registerAdmin);  // protected by ADMIN_SECRET
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;