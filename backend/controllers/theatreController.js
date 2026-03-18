const Theatre = require('../models/Theatre');
const { asyncHandler } = require('../middleware/errorMiddleware');

exports.getAllTheatres = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const query = { isActive: true };
  if (city) query['address.city'] = new RegExp(city, 'i');
  const theatres = await Theatre.find(query);
  res.json({ success: true, theatres });
});

exports.getTheatreById = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findById(req.params.id);
  if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
  res.json({ success: true, theatre });
});

exports.createTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.create(req.body);
  res.status(201).json({ success: true, message: 'Theatre created', theatre });
});

exports.updateTheatre = asyncHandler(async (req, res) => {
  const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
  res.json({ success: true, theatre });
});

exports.deleteTheatre = asyncHandler(async (req, res) => {
  await Theatre.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Theatre removed' });
});
