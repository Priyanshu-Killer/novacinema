const Movie = require('../models/Movie');
const { asyncHandler } = require('../middleware/errorMiddleware');

const NOW_SHOWING = ['now_showing', 'nowShowing', 'now showing', 'showing', 'active']
const UPCOMING    = ['upcoming', 'coming_soon', 'coming soon']

const getStatusQuery = (status) => {
  if (!status) return null
  const n = status.toLowerCase().replace(/[\s_-]/g, '')
  if (['nowshowing','showing','active'].includes(n)) return { $in: NOW_SHOWING }
  if (['upcoming','comingsoon'].includes(n))         return { $in: UPCOMING }
  if (n === 'ended')                                 return { $in: ['ended'] }
  return status
}

exports.getAllMovies = asyncHandler(async (req, res) => {
  const { status, genre, search, language, page = 1, limit = 50 } = req.query;

  const query = { isActive: true };

  if (status) {
    const sq = getStatusQuery(status)
    if (sq) query.status = sq
  }
  if (genre)    query.genre = { $in: [genre] };
  if (language) query.language = language;

  if (search && search.trim()) {
    const rx = new RegExp(search.trim(), 'i');
    query.$or = [
      { title:       rx },
      { genre:       rx },
      { director:    rx },
      { description: rx },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [movies, total] = await Promise.all([
    Movie.find(query).sort({ releaseDate: -1 }).skip(skip).limit(parseInt(limit)).lean(),
    Movie.countDocuments(query),
  ]);

  res.json({ success: true, movies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

exports.getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id).lean();
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  res.json({ success: true, movie });
});

exports.createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create({ ...req.body, isActive: true });
  res.status(201).json({ success: true, message: 'Movie created', movie });
});

exports.updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  res.json({ success: true, message: 'Movie updated', movie });
});

exports.deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  res.json({ success: true, message: 'Movie removed' });
});

exports.getFeaturedMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ status: { $in: NOW_SHOWING }, isActive: true })
    .sort({ imdbRating: -1 }).limit(6).lean();
  res.json({ success: true, movies });
});