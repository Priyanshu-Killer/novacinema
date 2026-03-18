import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

const emptyTheatre = { name: '', street: '', city: '', state: '', zipCode: '', phone: '', amenities: '' }

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyTheatre)
  const [saving, setSaving] = useState(false)

  const fetchTheatres = async () => {
    setLoading(true)
    try { const res = await api.get('/theatres'); setTheatres(res.data.theatres) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTheatres() }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/theatres', {
        name: form.name, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        screens: [
          { name: 'Screen 1', totalSeats: 100, rows: 10, columns: 10, seatLayout: [] },
          { name: 'Screen 2', totalSeats: 80, rows: 8, columns: 10, seatLayout: [] }
        ]
      })
      toast.success('Theatre added!'); setShowModal(false); fetchTheatres()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Theatres</h1>
              <p className="text-nova-400 text-sm mt-1">{theatres.length} theatres</p>
            </div>
            <button onClick={() => { setForm(emptyTheatre); setShowModal(true) }} className="nova-btn-primary">+ Add Theatre</button>
          </div>
          {loading ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
          : (
            <div className="space-y-4">
              {theatres.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-dark rounded-2xl border border-nova-700/30 p-5">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-display font-bold text-white">{t.name}</h3>
                      <p className="text-nova-400 text-sm mt-1">{t.address?.city}, {t.address?.state}</p>
                      <p className="text-nova-500 text-xs mt-0.5">{t.screens?.length || 0} screens</p>
                    </div>
                    <button onClick={async () => { if(confirm('Remove theatre?')) { await api.delete(`/theatres/${t._id}`); fetchTheatres() }}}
                      className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 h-fit">Remove</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-dark rounded-2xl w-full max-w-lg border border-nova-600/30 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-bold text-white">Add Theatre</h2>
              <button onClick={() => setShowModal(false)} className="text-nova-400">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { key: 'name', label: 'Theatre Name', required: true },
                { key: 'street', label: 'Street Address' },
                { key: 'city', label: 'City', required: true },
                { key: 'state', label: 'State' },
                { key: 'phone', label: 'Phone' },
                { key: 'amenities', label: 'Amenities (comma-separated)' }
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-nova-400 mb-1 block">{f.label}</label>
                  <input required={f.required} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={saving} className="nova-btn-cyan flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Add Theatre'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="nova-btn-outline px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
