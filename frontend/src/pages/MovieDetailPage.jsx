import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovieById } from '../store/slices/movieSlice'

export default function MovieDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedMovie: movie, loading, error } = useSelector(s => s.movies)
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    if (id) dispatch(fetchMovieById(id))
  }, [id, dispatch])

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${id}` } })
      return
    }
    navigate(`/booking/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-10 max-w-md w-full">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-white/50 text-sm mb-6">{error || 'Could not load this movie.'}</p>
          <button onClick={() => navigate('/movies')} className="nova-btn-cyan">
            ← Back to Movies
          </button>
        </div>
      </div>
    )
  }

  const fmt = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''

  // ── field aliases: handle both old & new field names ──
  const poster    = movie.posterUrl  || movie.poster  || ''
  const rawTrailer = movie.trailerUrl || movie.trailer || ''
  const trailer = (() => {
    if (!rawTrailer) return ''
    if (rawTrailer.includes('/embed/')) return rawTrailer
    // youtu.be/abc123
    const short = rawTrailer.match(/youtu\.be\/([^?&]+)/)
    if (short) return `https://www.youtube.com/embed/${short[1]}`
    // watch?v=abc123
    const watch = rawTrailer.match(/[?&]v=([^&]+)/)
    if (watch) return `https://www.youtube.com/embed/${watch[1]}`
    return rawTrailer
  })()
  const director  = movie.director   || ''
  const language  = Array.isArray(movie.language)
    ? movie.language.join(', ')
    : (movie.language || '')
  const isShowing = ['now_showing', 'nowShowing', 'now-showing', 'showing', 'active'].includes(movie.status)

  return (
    <div className="min-h-screen pt-16">

      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-[#030206]">
          {poster && (
            <img
              src={poster}
              alt={movie.title}
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#030206] via-[#030206]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030206]/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex gap-6 items-end">
            {poster && (
              <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                className="hidden md:block w-36 lg:w-44 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
                <img src={poster} alt={movie.title} className="w-full h-auto"
                  onError={e => { e.target.parentElement.style.display = 'none' }} />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {(movie.genre || []).map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-full text-xs border border-violet-500/50 text-violet-300 bg-violet-500/10">{g}</span>
                ))}
                {movie.rating && (
                  <span className="px-2 py-0.5 rounded-full text-xs border border-cyan-500/50 text-cyan-400 bg-cyan-500/10">{movie.rating}</span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                {movie.imdbRating > 0 && <span className="text-yellow-400 font-semibold">★ {movie.imdbRating}/10 IMDb</span>}
                {movie.duration > 0   && <span>{fmt(movie.duration)}</span>}
                {year                 && <span>{year}</span>}
                {language             && <span>{language}</span>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-8">

            {/* Synopsis */}
            {movie.description && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Synopsis</h2>
                <p className="text-white/60 leading-relaxed">{movie.description}</p>
              </section>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4">Cast</h2>
                <div className="flex flex-wrap gap-4">
                  {movie.cast.map((member, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex flex-col items-center gap-2 text-center"
                      style={{ minWidth: '72px', maxWidth: '90px' }}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6633d4,#ff2d6b)' }}>
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;color:#fff">${member.name?.[0]?.toUpperCase() || '?'}</div>`
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-snug">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-white/40 leading-snug mt-0.5">{member.role}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Trailer */}
            {trailer && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Trailer</h2>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={trailer}
                    className="w-full h-full"
                    allowFullScreen
                    title="Trailer"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right — Booking Panel */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/10 sticky top-24">

              <div className="flex items-center justify-between mb-5">
                <p className={`text-xs font-mono font-bold ${isShowing ? 'text-cyan-400' : 'text-yellow-400'}`}>
                  {isShowing ? '● NOW SHOWING' : '◆ COMING SOON'}
                </p>
                {movie.rating && (
                  <span className="px-2 py-1 rounded text-xs border border-white/20 text-white/50">{movie.rating}</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {[
                  ['Director',  director],
                  ['Duration',  movie.duration ? fmt(movie.duration) : null],
                  ['Release',   movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null],
                  ['Language',  language],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2 text-sm">
                    <span className="text-white/40 flex-shrink-0">{label}</span>
                    <span className="text-white/80 text-right">{val}</span>
                  </div>
                ))}
              </div>

              {isShowing ? (
                <button onClick={handleBooking} className="nova-btn-cyan w-full text-center">
                  Book Tickets Now
                </button>
              ) : (
                <button onClick={handleBooking} className="nova-btn-cyan w-full text-center">
                  Book Tickets
                </button>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}