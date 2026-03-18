const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Fallback secret — ALWAYS works even if .env is missing
const JWT_SECRET = process.env.JWT_SECRET || 'novacinema_fallback_secret_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// Register a new ADMIN — requires ADMIN_SECRET from .env
exports.registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, adminSecret } = req.body;

  // Validate secret key
  const correctSecret = process.env.ADMIN_SECRET || 'novacinema_admin_2024';
  if (adminSecret !== correctSecret)
    return res.status(403).json({ success: false, message: 'Invalid admin secret key' });

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone, role: 'admin' });
  const token = signToken(user._id);

  console.log(`[ADMIN CREATED] ${email}`);

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' });

  // Find user — explicitly select password field (it's hidden by default)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    console.log(`[LOGIN] No user found for email: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    console.log(`[LOGIN] Wrong password for: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive)
    return res.status(401).json({ success: false, message: 'Account has been deactivated' });

  const token = signToken(user._id);

  console.log(`[LOGIN] Success: ${email} (${user.role})`);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
  res.json({ success: true, user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

  const user = await User.findById(req.user._id).select('+password');
  const match = await user.comparePassword(currentPassword);
  if (!match)
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});