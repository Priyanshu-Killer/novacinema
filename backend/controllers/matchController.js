const Match = require('../models/Match')
const MatchBooking = require('../models/MatchBooking')
const { asyncHandler } = require('../middleware/errorMiddleware')

exports.getAllMatches = asyncHandler(async (req, res) => {
  const { status, sport, city, page = 1, limit = 50 } = req.query
  const query = { isActive: true }
  if (status) query.status = status
  if (sport)  query.sport  = sport
  if (city)   query.city   = new RegExp(city, 'i')

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const [matches, total] = await Promise.all([
    Match.find(query).sort({ matchDate: 1 }).skip(skip).limit(parseInt(limit)).lean(),
    Match.countDocuments(query)
  ])
  res.json({ success: true, matches, total })
})

exports.getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id).lean()
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' })
  res.json({ success: true, match })
})

exports.createMatch = asyncHandler(async (req, res) => {
  const match = await Match.create({ ...req.body, isActive: true })
  res.status(201).json({ success: true, message: 'Match created', match })
})

exports.updateMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' })
  res.json({ success: true, message: 'Match updated', match })
})

exports.deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' })
  res.json({ success: true, message: 'Match removed' })
})

exports.bookMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' })
  if (match.status !== 'upcoming') return res.status(400).json({ success: false, message: 'Booking not available' })

  const { tickets } = req.body // [{ category, quantity }]
  if (!tickets || !tickets.length) return res.status(400).json({ success: false, message: 'No tickets selected' })

  let totalAmount = 0
  const bookedTickets = []

  for (const t of tickets) {
    const cat = match.ticketCategories.find(c => c.name === t.category)
    if (!cat) return res.status(400).json({ success: false, message: `Category ${t.category} not found` })
    const available = cat.totalSeats - cat.bookedSeats
    if (t.quantity > available) return res.status(400).json({ success: false, message: `Only ${available} seats left in ${t.category}` })
    cat.bookedSeats += t.quantity
    totalAmount += cat.price * t.quantity
    bookedTickets.push({ category: t.category, price: cat.price, quantity: t.quantity })
  }

  await match.save()

  const booking = await MatchBooking.create({
    user: req.user._id,
    match: match._id,
    tickets: bookedTickets,
    totalAmount,
    paymentStatus: 'paid',
    status: 'confirmed'
  })

  res.status(201).json({ success: true, message: 'Booking confirmed!', booking })
})

exports.getMyMatchBookings = asyncHandler(async (req, res) => {
  const bookings = await MatchBooking.find({ user: req.user._id })
    .populate('match', 'title team1 team2 matchDate matchTime venue sport bannerUrl')
    .sort({ createdAt: -1 })
  res.json({ success: true, bookings })
})

exports.getMatchBookingById = asyncHandler(async (req, res) => {
  const booking = await MatchBooking.findById(req.params.id)
    .populate('match', 'title team1 team2 matchDate matchTime venue sport bannerUrl team1Logo team2Logo')
    .populate('user', 'name email')
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' })
  res.json({ success: true, booking })
})