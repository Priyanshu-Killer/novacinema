import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import toast from 'react-hot-toast'

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary','Drama','Fantasy','Horror','Musical','Mystery','Romance','Sci-Fi','Thriller','Western']
const LANGUAGES = ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Gujarati','Punjabi']
const RATINGS = ['U','UA','A','S']

const emptyMovie = {
  title: '', description: '', genre: [], language: 'English', duration: '',
  releaseDate: '', rating: 'UA', posterUrl: '', trailerUrl: '', director: '',
  status: 'upcoming', cast: []
}

function CastRow({ member, index, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start p-3 rounded-lg bg-white/5 border border-white/10">
      {member.photoUrl ? (
        <img src={member.photoUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
      ) : (
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #6633d4, #ff2d6b)' }}>
          {member.name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input className="input-field text-sm" placeholder="Name *" value={member.name}
          onChange={e => onChange(index, 'name', e.target.value)} />
        <input className="input-field text-sm" placeholder="Role (e.g. Lead Actor)" value={member.role}
          onChange={e => onChange(index, 'role', e.target.value)} />
        <input className="input-field text-sm" placeholder="Photo URL (optional)" value={member.photoUrl}
          onChange={e => onChange(index, 'photoUrl', e.target.value)} />
      </div>
      <button onClick={() => onRemove(index)} className="p-1 text-red-400 hover:text-red-300 flex-shrink-0 mt-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyMovie)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { loadMovies() }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const res = await api.get('/movies?limit=100')
      setMovies(res.data.movies || [])
    } catch {
      toast.error('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm(emptyMovie)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (movie) => {
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || [],
      language: movie.language || 'English',
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      rating: movie.rating || 'UA',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      director: movie.director || '',
      status: movie.status || 'upcoming',
      cast: (movie.cast || []).map(c => ({ name: c.name || '', role: c.role || '', photoUrl: c.photoUrl || '' }))
    })
    setEditingId(movie._id)
    setShowModal(true)
  }

  const handleGenreToggle = (g) => {
    setForm(f => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter(x => x !== g) : [...f.genre, g]
    }))
  }

  const addCast = () => setForm(f => ({ ...f, cast: [...f.cast, { name: '', role: '', photoUrl: '' }] }))
  const updateCast = (i, field, val) => setForm(f => {
    const c = [...f.cast]; c[i] = { ...c[i], [field]: val }; return { ...f, cast: c }
  })
  const removeCast = (i) => setForm(f => ({ ...f, cast: f.cast.filter((_, idx) => idx !== i) }))

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.duration || isNaN(form.duration)) return toast.error('Valid duration required')
    if (form.genre.length === 0) return toast.error('Select at least one genre')

    const payload = {
      ...form,
      duration: Number(form.duration),
      cast: form.cast.filter(c => c.name.trim())
    }

    try {
      setSaving(true)
      if (editingId) {
        await api.put(`/movies/${editingId}`, payload)
        toast.success('Movie updated!')
      } else {
        await api.post('/movies', payload)
        toast.success('Movie added!')
      }
      setShowModal(false)
      loadMovies()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/movies/${id}`)
      toast.success('Movie deleted')
      setDeleteId(null)
      loadMovies()
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = movies.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="heading-lg text-white">Movies</h1>
          <p className="text-white/50 text-sm mt-1">{movies.length} total movies</p>
        </div>
        <div className="sm:ml-auto flex gap-3">
          <input
            className="input-field w-52 text-sm"
            placeholder="Search movies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={openAdd} className="btn-volt whitespace-nowrap">+ Add Movie</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">Loading...</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Movie</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Genre</th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell">Status</th>
                  <th className="text-left py-3 px-4 hidden lg:table-cell">Cast</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-white/30">No movies found</td></tr>
                )}
                {filtered.map(movie => (
                  <tr key={movie._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {movie.posterUrl && (
                          <img src={movie.posterUrl} alt={movie.title}
                            className="w-10 h-14 object-cover rounded" onError={e => e.target.style.display='none'} />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{movie.title}</p>
                          <p className="text-white/40 text-xs">{movie.language} · {movie.duration} min</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(movie.genre || []).slice(0,2).map(g => (
                          <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        movie.status === 'now_showing' || movie.status === 'nowShowing' ? 'bg-green-500/20 text-green-400' :
                        movie.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {movie.status === 'now_showing' ? 'now showing' : movie.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {movie.cast?.length > 0 ? (
                        <span className="text-xs text-white/50">👥 {movie.cast.length} members</span>
                      ) : (
                        <span className="text-xs text-white/20">No cast</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(movie)}
                          className="text-xs px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(movie._id)}
                          className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass w-full max-w-3xl rounded-2xl p-6 space-y-6 my-auto">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowModal(false)}
                    className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <span className="text-white/20">|</span>
                  <h2 className="text-white font-semibold text-lg">{editingId ? 'Edit Movie' : 'Add Movie'}</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/80 text-2xl leading-none">&times;</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Title *</label>
                  <input className="input-field" placeholder="Movie title" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input-field resize-none h-24" placeholder="Synopsis..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Director</label>
                  <input className="input-field" placeholder="Director name" value={form.director}
                    onChange={e => setForm(f => ({ ...f, director: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Duration (minutes) *</label>
                  <input className="input-field" type="number" placeholder="120" value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Language</label>
                  <select className="input-field" value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Rating</label>
                  <select className="input-field" value={form.rating}
                    onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}>
                    {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Release Date</label>
                  <input className="input-field" type="date" value={form.releaseDate}
                    onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
                    style={{ colorScheme: 'dark' }} />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="upcoming">Upcoming</option>
                    <option value="now_showing">Now Showing</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Poster URL</label>
                  <input className="input-field" placeholder="https://..." value={form.posterUrl}
                    onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Trailer URL (YouTube embed)</label>
                  <input className="input-field" placeholder="https://www.youtube.com/embed/..." value={form.trailerUrl}
                    onChange={e => setForm(f => ({ ...f, trailerUrl: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Genres *</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {GENRES.map(g => (
                      <button key={g} type="button" onClick={() => handleGenreToggle(g)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          form.genre.includes(g)
                            ? 'border-violet-500 bg-violet-500/30 text-violet-200'
                            : 'border-white/20 text-white/50 hover:border-white/40'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cast Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Cast Members</label>
                  <button onClick={addCast} type="button"
                    className="text-xs px-3 py-1.5 rounded-lg border border-violet-500/50 text-violet-400 hover:bg-violet-500/20 transition-colors">
                    + Add Member
                  </button>
                </div>

                {form.cast.length === 0 ? (
                  <div className="text-center py-6 rounded-lg border border-dashed border-white/10 text-white/30 text-sm">
                    No cast added. Click "+ Add Member" to start.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {form.cast.map((member, i) => (
                      <CastRow key={i} member={member} index={i} onChange={updateCast} onRemove={removeCast} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-volt min-w-24">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Movie'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="text-4xl">🗑️</div>
              <h3 className="text-white font-semibold">Delete Movie?</h3>
              <p className="text-white/50 text-sm">This cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteId(null)} className="btn-outline">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="btn-rose">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}