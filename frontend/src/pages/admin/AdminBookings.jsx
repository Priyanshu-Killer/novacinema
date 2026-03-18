import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'

export default function AdminBookings() {
  const [bookings, setBookings]           = useState([])
  const [matchBookings, setMatchBookings] = useState([])
  const [loading, setLoading]             = useState(true)
  const [matchLoading, setMatchLoading]   = useState(true)
  const [activeTab, setActiveTab]         = useState('movies')

  useEffect(() => {
    api.get('/admin/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .finally(() => setLoading(false))

    // fetch all match bookings — reuse the my endpoint or add admin endpoint
    api.get('/matches/bookings/my')
      .then(res => setMatchBookings(res.data.bookings || []))
      .catch(() => setMatchBookings([]))
      .finally(() => setMatchLoading(false))
  }, [])

  const statusColors = {
    confirmed: 'text-cyan-400 bg-cyan-500/10',
    cancelled:  'text-red-400 bg-red-500/10',
    pending:    'text-yellow-400 bg-yellow-500/10',
    expired:    'text-white/30 bg-white/5',
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-white">All Bookings</h1>
            <p className="text-nova-400 text-sm mt-1">{bookings.length + matchBookings.length} total bookings</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'movies',  label: '🎬 Movie Bookings', count: bookings.length },
              { id: 'matches', label: '🏏 Match Bookings',  count: matchBookings.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 18px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600,
                  background: activeTab === tab.id ? 'rgba(102,51,212,0.35)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(102,51,212,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ marginLeft: '6px', background: activeTab===tab.id ? '#ff2d6b' : 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── MOVIE BOOKINGS ── */}
          {activeTab === 'movies' && (
            loading
              ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
              : (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-nova-700/30 text-nova-400 text-xs font-mono uppercase tracking-wider">
                          {['Booking ID','User','Movie','Date','Seats','Amount','Status'].map(h => (
                            <th key={h} className="text-left py-3 px-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 && (
                          <tr><td colSpan={7} className="text-center py-12 text-nova-500">No movie bookings found</td></tr>
                        )}
                        {bookings.map((b, i) => (
                          <motion.tr key={b._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.02 }}
                            className="border-b border-nova-800/50 hover:bg-nova-900/20">
                            <td className="py-3 px-4 font-mono text-xs text-nova-400">{b.bookingId}</td>
                            <td className="py-3 px-4 text-white">{b.user?.name}<br/><span className="text-nova-500 text-xs">{b.user?.email}</span></td>
                            <td className="py-3 px-4 text-nova-300 max-w-32 truncate">{b.movie?.title}</td>
                            <td className="py-3 px-4 text-nova-400 text-xs font-mono">{b.showDate}</td>
                            <td className="py-3 px-4 text-nova-400">{b.seats?.length} seat(s)</td>
                            <td className="py-3 px-4 text-yellow-400 font-mono font-bold">₹{b.finalAmount}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${statusColors[b.status] || statusColors.expired}`}>{b.status}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
          )}

          {/* ── MATCH BOOKINGS ── */}
          {activeTab === 'matches' && (
            matchLoading
              ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-white/20 border-t-green-400 rounded-full animate-spin mx-auto" /></div>
              : (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-xs font-mono uppercase tracking-wider">
                          {['Booking No','Match','Date','Venue','Tickets','Amount','Status'].map(h => (
                            <th key={h} className="text-left py-3 px-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matchBookings.length === 0 && (
                          <tr><td colSpan={7} className="text-center py-12 text-white/30">No match bookings found</td></tr>
                        )}
                        {matchBookings.map((b, i) => {
                          const match = b.match
                          const matchDate = match?.matchDate ? new Date(match.matchDate) : null
                          return (
                            <motion.tr key={b._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.02 }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-mono text-xs text-white/40">{b.bookingNumber}</td>
                              <td className="py-3 px-4">
                                <p className="text-white font-medium text-xs">{match?.title}</p>
                                <p className="text-white/40 text-xs mt-0.5">{match?.team1} vs {match?.team2}</p>
                              </td>
                              <td className="py-3 px-4 text-white/50 text-xs font-mono">
                                {matchDate ? matchDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                                <br/>{match?.matchTime}
                              </td>
                              <td className="py-3 px-4 text-white/40 text-xs">{match?.venue}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {b.tickets?.map((t, ti) => (
                                    <span key={ti} style={{
                                      fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 600,
                                      background: t.category==='VIP' ? 'rgba(251,191,36,0.15)' : t.category==='Premium' ? 'rgba(129,140,248,0.15)' : 'rgba(74,222,128,0.15)',
                                      color: t.category==='VIP' ? '#fcd34d' : t.category==='Premium' ? '#a5b4fc' : '#86efac',
                                    }}>
                                      {t.category}×{t.quantity}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span style={{ color:'#b8ff00', fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>₹{b.totalAmount}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${statusColors[b.status] || statusColors.confirmed}`}>
                                  {b.status}
                                </span>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
          )}
        </div>
      </main>
    </div>
  )
}