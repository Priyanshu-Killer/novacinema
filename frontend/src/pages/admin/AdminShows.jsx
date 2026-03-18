// AdminShows.jsx
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

const emptyShow = { movie: '', theatre: '', screen: '', showDate: '', showTime: '10:00', format: '2D', language: 'English', standardPrice: 200, premiumPrice: 350, reclinerPrice: 500 }

export function AdminShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyShow)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/shows', {}).catch(() => ({ data: { shows: [] } })),
      api.get('/movies', { params: { limit: 100 } }),
      api.get('/theatres')
    ]).then(([s, m, t]) => {
      setShows(s.data.shows || [])
      setMovies(m.data.movies || [])
      setTheatres(t.data.theatres || [])
    }).finally(() => setLoading(false))
  }, [])

  const selectedTheatre = theatres.find(t => t._id === form.theatre)

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/shows', {
        movie: form.movie, theatre: form.theatre, screen: form.screen || 'Screen 1',
        showDate: form.showDate, showTime: form.showTime, format: form.format, language: form.language,
        pricing: { standard: parseInt(form.standardPrice), premium: parseInt(form.premiumPrice), recliner: parseInt(form.reclinerPrice) }
      })
      toast.success('Show created!')
      setShowModal(false)
      const res = await api.get('/shows', {})
      setShows(res.data.shows || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Shows</h1>
              <p className="text-nova-400 text-sm mt-1">{shows.length} scheduled shows</p>
            </div>
            <button onClick={() => { setForm(emptyShow); setShowModal(true) }} className="nova-btn-primary">+ Add Show</button>
          </div>
          {loading ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-nova-700/30 text-nova-400 text-xs font-mono uppercase tracking-wider">
                    {['Movie', 'Theatre', 'Date', 'Time', 'Format', 'Available', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shows.slice(0, 50).map((show, i) => (
                    <motion.tr key={show._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-nova-800/50 hover:bg-nova-900/20">
                      <td className="py-3 px-4 text-white font-medium truncate max-w-32">{show.movie?.title}</td>
                      <td className="py-3 px-4 text-nova-400 truncate max-w-32">{show.theatre?.name}</td>
                      <td className="py-3 px-4 text-nova-400 font-mono text-xs">{show.showDate ? new Date(show.showDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="py-3 px-4 text-cyan-400 font-mono">{show.showTime}</td>
                      <td className="py-3 px-4 text-nova-400">{show.format}</td>
                      <td className="py-3 px-4 text-white">{show.availableSeats}/{show.totalSeats}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${show.status === 'scheduled' ? 'text-cyan-400 bg-cyan-500/10' : 'text-nova-500 bg-nova-800'}`}>
                          {show.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={async () => { if(confirm('Cancel this show?')) { await api.delete(`/shows/${show._id}`); toast.success('Show cancelled'); const r = await api.get('/shows', {}); setShows(r.data.shows || []) }}}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {shows.length === 0 && <div className="text-center py-12 text-nova-500">No shows found</div>}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-dark rounded-2xl w-full max-w-lg border border-nova-600/30 p-6 my-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-bold text-white">Add Show</h2>
              <button onClick={() => setShowModal(false)} className="text-nova-400">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-nova-400 mb-1 block">Movie</label>
                <select required value={form.movie} onChange={e => setForm({...form, movie: e.target.value})}
                  className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="">Select Movie</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-nova-400 mb-1 block">Theatre</label>
                <select required value={form.theatre} onChange={e => setForm({...form, theatre: e.target.value, screen: ''})}
                  className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="">Select Theatre</option>
                  {theatres.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              {selectedTheatre && (
                <div>
                  <label className="text-xs text-nova-400 mb-1 block">Screen</label>
                  <select value={form.screen} onChange={e => setForm({...form, screen: e.target.value})}
                    className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                    {selectedTheatre.screens?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-nova-400 mb-1 block">Date</label>
                  <input type="date" required value={form.showDate} onChange={e => setForm({...form, showDate: e.target.value})}
                    style={{ width:'100%', background:'rgba(13,10,24,0.8)', border:'1px solid rgba(102,51,212,0.3)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'0.875rem', outline:'none', colorScheme:'dark', fontFamily:'DM Sans, sans-serif' }} />
                </div>
                <div>
                  <label className="text-xs text-nova-400 mb-1 block">Time</label>
                  <input type="time" required value={form.showTime} onChange={e => setForm({...form, showTime: e.target.value})}
                    style={{ width:'100%', background:'rgba(13,10,24,0.8)', border:'1px solid rgba(102,51,212,0.3)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'0.875rem', outline:'none', colorScheme:'dark', fontFamily:'DM Sans, sans-serif' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-nova-400 mb-1 block">Format</label>
                  <select value={form.format} onChange={e => setForm({...form, format: e.target.value})}
                    className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                    {['2D', '3D', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-nova-400 mb-1 block">Language</label>
                  <input value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                    className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['standardPrice', 'Standard ₹'], ['premiumPrice', 'Premium ₹'], ['reclinerPrice', 'Recliner ₹']].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs text-nova-400 mb-1 block">{label}</label>
                    <input type="number" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={saving} className="nova-btn-cyan flex-1 disabled:opacity-50">{saving ? 'Creating...' : 'Create Show'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="nova-btn-outline px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminShows