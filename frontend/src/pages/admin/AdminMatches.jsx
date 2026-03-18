import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import toast from 'react-hot-toast'

const emptyMatch = {
  title: '', team1: '', team2: '', team1Logo: '', team2Logo: '',
  venue: '', city: '', matchDate: '', matchTime: '',
  format: 'T20', sport: 'Cricket', description: '', bannerUrl: '', status: 'upcoming',
  ticketCategories: [
    { name: 'General',  price: 500,  totalSeats: 1000, color: '#6633d4' },
    { name: 'Premium',  price: 1500, totalSeats: 300,  color: '#ff2d6b' },
    { name: 'VIP',      price: 3000, totalSeats: 100,  color: '#b8ff00' },
  ]
}

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyMatch)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { loadMatches() }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const res = await api.get('/matches?limit=100')
      setMatches(res.data.matches || [])
    } catch { toast.error('Failed to load matches') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setForm(emptyMatch); setEditingId(null); setShowModal(true) }
  const openEdit = (m) => {
    setForm({
      title: m.title||'', team1: m.team1||'', team2: m.team2||'',
      team1Logo: m.team1Logo||'', team2Logo: m.team2Logo||'',
      venue: m.venue||'', city: m.city||'',
      matchDate: m.matchDate ? m.matchDate.split('T')[0] : '',
      matchTime: m.matchTime||'', format: m.format||'T20', sport: m.sport||'Cricket',
      description: m.description||'', bannerUrl: m.bannerUrl||'', status: m.status||'upcoming',
      ticketCategories: m.ticketCategories?.length ? m.ticketCategories.map(c => ({ ...c })) : emptyMatch.ticketCategories
    })
    setEditingId(m._id); setShowModal(true)
  }

  const updateCat = (i, field, val) => setForm(f => {
    const cats = [...f.ticketCategories]; cats[i] = { ...cats[i], [field]: field === 'price' || field === 'totalSeats' ? Number(val) : val }
    return { ...f, ticketCategories: cats }
  })

  const handleSave = async () => {
    if (!form.title || !form.team1 || !form.team2 || !form.venue || !form.matchDate || !form.matchTime)
      return toast.error('Fill all required fields')
    try {
      setSaving(true)
      if (editingId) { await api.put(`/matches/${editingId}`, form); toast.success('Match updated!') }
      else           { await api.post('/matches', form);             toast.success('Match added!') }
      setShowModal(false); loadMatches()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/matches/${id}`); toast.success('Match deleted'); setDeleteId(null); loadMatches() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="heading-lg text-white">Matches</h1>
          <p className="text-white/50 text-sm mt-1">{matches.length} total matches</p>
        </div>
        <div className="sm:ml-auto">
          <button onClick={openAdd} className="btn-volt">+ Add Match</button>
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
                  <th className="text-left py-3 px-4">Match</th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell">Status</th>
                  <th className="text-left py-3 px-4 hidden lg:table-cell">Venue</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-white/30">No matches found</td></tr>}
                {matches.map(m => (
                  <tr key={m._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium text-sm">🏏 {m.title}</p>
                      <p className="text-white/40 text-xs">{m.team1} vs {m.team2}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-white/60 text-sm">
                      {m.matchDate ? new Date(m.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        m.status === 'upcoming'  ? 'bg-green-500/20 text-green-400' :
                        m.status === 'live'      ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/40'
                      }`}>{m.status}</span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-white/50 text-sm">{m.venue}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="text-xs px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">Edit</button>
                        <button onClick={() => setDeleteId(m._id)} className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass w-full max-w-2xl rounded-2xl p-6 space-y-5 my-auto">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowModal(false)} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                  <span className="text-white/20">|</span>
                  <h2 className="text-white font-semibold text-lg">{editingId ? 'Edit Match' : 'Add Match'}</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/80 text-2xl">&times;</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Match Title *</label>
                  <input className="input-field" placeholder="India vs Australia - 1st T20" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Team 1 *</label>
                  <input className="input-field" placeholder="India" value={form.team1} onChange={e => setForm(f => ({...f, team1: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Team 2 *</label>
                  <input className="input-field" placeholder="Australia" value={form.team2} onChange={e => setForm(f => ({...f, team2: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Team 1 Logo URL</label>
                  <input className="input-field" placeholder="https://..." value={form.team1Logo} onChange={e => setForm(f => ({...f, team1Logo: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Team 2 Logo URL</label>
                  <input className="input-field" placeholder="https://..." value={form.team2Logo} onChange={e => setForm(f => ({...f, team2Logo: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Venue *</label>
                  <input className="input-field" placeholder="Wankhede Stadium" value={form.venue} onChange={e => setForm(f => ({...f, venue: e.target.value}))} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input-field" placeholder="Mumbai" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Match Date *</label>
                  <input className="input-field" type="date" value={form.matchDate} onChange={e => setForm(f => ({...f, matchDate: e.target.value}))} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="label">Match Time *</label>
                  <input className="input-field" type="time" value={form.matchTime} onChange={e => setForm(f => ({...f, matchTime: e.target.value}))} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="label">Format</label>
                  <select className="input-field" value={form.format} onChange={e => setForm(f => ({...f, format: e.target.value}))}>
                    {['T20','ODI','Test','IPL','T10'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    {['upcoming','live','completed','cancelled'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Banner URL</label>
                  <input className="input-field" placeholder="https://..." value={form.bannerUrl} onChange={e => setForm(f => ({...f, bannerUrl: e.target.value}))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input-field resize-none h-20" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </div>
              </div>

              {/* Ticket Categories */}
              <div>
                <label className="label">Ticket Categories</label>
                <div className="space-y-2">
                  {form.ticketCategories.map((cat, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Category</p>
                        <input className="input-field text-sm" value={cat.name} onChange={e => updateCat(i, 'name', e.target.value)} />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Price (₹)</p>
                        <input className="input-field text-sm" type="number" value={cat.price} onChange={e => updateCat(i, 'price', e.target.value)} />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Total Seats</p>
                        <input className="input-field text-sm" type="number" value={cat.totalSeats} onChange={e => updateCat(i, 'totalSeats', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-volt min-w-24">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Match'}
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
              <h3 className="text-white font-semibold">Delete Match?</h3>
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