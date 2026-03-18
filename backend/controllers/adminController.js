const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalMovies, totalBookings, revenueData] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Movie.countDocuments({ isActive: true }),
    Booking.countDocuments({ status: 'confirmed' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  // Monthly revenue for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
      revenue: { $sum: '$amount' },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top movies by bookings
  const topMovies = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$movie', bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
    { $unwind: '$movie' }
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalMovies,
      totalBookings,
      totalRevenue: revenueData[0]?.total || 0,
      monthlyRevenue,
      topMovies
    }
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('movie', 'title poster')
    .populate('theatre', 'name address')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, bookings });
});
