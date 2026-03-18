import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserBookings } from '../../store/slices/bookingSlice'
import api from '../../services/api'

export default function BookingHistoryPage() {
  const dispatch = useDispatch()
  const { userBookings, loading } = useSelector(s => s.booking)
  const [matchBookings, setMatchBookings] = useState([])
  const [matchLoading, setMatchLoading]   = useState(true)
  const [activeTab, setActiveTab]         = useState('movies')

  useEffect(() => {
    dispatch(fetchUserBookings())
    api.get('/matches/bookings/my')
      .then(res => setMatchBookings(res.data.bookings || []))
      .catch(() => setMatchBookings([]))
      .finally(() => setMatchLoading(false))
  }, [])

  const statusColors = {
    confirmed: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    cancelled:  'text-red-400 bg-red-500/10 border-red-500/30',
    pending:    'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    expired:    'text-white/30 bg-white/5 border-white/10',
  }

  const totalCount = userBookings.length + matchBookings.length

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-heading">My Bookings</h1>
            <p className="text-nova-400 text-sm mt-1">{totalCount} booking{totalCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'movies',  label: '🎬 Movie Tickets', count: userBookings.length },
            { id: 'matches', label: '🏏 Match Tickets',  count: matchBookings.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 18px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600,
                background: activeTab === tab.id ? 'rgba(102,51,212,0.35)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(102,51,212,0.6)' : 'rgba(255,255,255,0.1)'}`,
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{ marginLeft: '6px', background: activeTab === tab.id ? '#ff2d6b' : 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── MOVIE BOOKINGS ── */}
        {activeTab === 'movies' && (
          loading ? (
            <div className="text-center py-16"><div className="w-10 h-10 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
          ) : userBookings.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-nova-300 text-lg font-semibold">No movie bookings yet</p>
              <p className="text-nova-500 text-sm mt-2">Start your cinematic journey today!</p>
              <Link to="/movies" className="nova-btn-cyan inline-block mt-6">Browse Movies</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map((booking, i) => (
                <motion.div key={booking._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-dark rounded-2xl border border-nova-700/30 overflow-hidden hover:border-nova-500/50 transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-24 h-24 md:h-auto flex-shrink-0">
                      {booking.movie?.poster ? (
                        <img src={booking.movie.poster} alt={booking.movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-nova-800 flex items-center justify-center text-3xl">🎬</div>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-white">{booking.movie?.title}</h3>
                        <p className="text-nova-400 text-sm mt-1">{booking.theatre?.name}</p>
                        <p className="text-nova-500 text-xs mt-1 font-mono">{booking.showDate} · {booking.showTime}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {booking.seats?.map(s => (
                            <span key={`${s.row}${s.seatNumber}`} className="text-xs px-2 py-0.5 bg-nova-800 text-nova-300 rounded font-mono">
                              {s.row}{s.seatNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-3 py-1 rounded-full border font-mono uppercase ${statusColors[booking.status] || statusColors.expired}`}>
                          {booking.status}
                        </span>
                        <p className="font-display text-xl font-bold text-gradient-gold mt-2">₹{booking.finalAmount}</p>
                        <p className="text-xs text-nova-500 font-mono mt-1">{booking.bookingId}</p>
                      </div>
                    </div>
                  </div>
                  {booking.status === 'confirmed' && booking.qrCode && (
                    <div className="border-t border-nova-700/20 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nova-400">Scan this QR code at the theatre</p>
                        <p className="text-xs text-nova-600 mt-0.5">Valid for: {booking.bookingId}</p>
                      </div>
                      <img src={booking.qrCode} alt="QR Code" className="w-16 h-16 rounded-lg bg-white p-1" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* ── MATCH BOOKINGS ── */}
        {activeTab === 'matches' && (
          matchLoading ? (
            <div className="text-center py-16"><div className="w-10 h-10 border-2 border-white/20 border-t-green-400 rounded-full animate-spin mx-auto" /></div>
          ) : matchBookings.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <div className="text-6xl mb-4">🏏</div>
              <p className="text-white/60 text-lg font-semibold">No match bookings yet</p>
              <p className="text-white/30 text-sm mt-2">Book tickets for upcoming cricket matches!</p>
              <Link to="/matches" className="nova-btn-cyan inline-block mt-6">Browse Matches</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {matchBookings.map((booking, i) => {
                const match = booking.match
                const matchDate = match?.matchDate ? new Date(match.matchDate) : null
                return (
                  <motion.div key={booking._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'rgba(13,10,24,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}>

                    {/* Match banner strip */}
                    <div style={{
                      background: match?.bannerUrl
                        ? `url(${match.bannerUrl}) center/cover`
                        : 'linear-gradient(135deg,#0d0520,#1a0a3d,#0a1a0d)',
                      height: '60px', position: 'relative',
                    }}>
                      {match?.bannerUrl && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />}
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                        <span style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.3rem', color:'#fff', letterSpacing:'0.05em' }}>{match?.team1}</span>
                        <span style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1rem', color:'#b8ff00' }}>VS</span>
                        <span style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.3rem', color:'#fff', letterSpacing:'0.05em' }}>{match?.team2}</span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{match?.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40 font-mono">
                          {matchDate && <span>📅 {matchDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
                          {match?.matchTime && <span>⏰ {match.matchTime}</span>}
                          {match?.venue && <span>📍 {match.venue}</span>}
                          {match?.sport && <span>🏏 {match.sport}</span>}
                        </div>

                        {/* Tickets breakdown */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {booking.tickets?.map((t, ti) => (
                            <div key={ti} style={{
                              padding: '4px 10px', borderRadius: '8px',
                              background: t.category==='VIP' ? 'rgba(251,191,36,0.15)' : t.category==='Premium' ? 'rgba(129,140,248,0.15)' : 'rgba(74,222,128,0.15)',
                              border: `1px solid ${t.category==='VIP' ? 'rgba(251,191,36,0.3)' : t.category==='Premium' ? 'rgba(129,140,248,0.3)' : 'rgba(74,222,128,0.3)'}`,
                            }}>
                              <span style={{ color: t.category==='VIP'?'#fcd34d':t.category==='Premium'?'#a5b4fc':'#86efac', fontSize:'0.72rem', fontWeight:600 }}>
                                {t.category} × {t.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-3 py-1 rounded-full border font-mono uppercase ${statusColors[booking.status] || statusColors.confirmed}`}>
                          {booking.status}
                        </span>
                        <p style={{ color:'#b8ff00', fontSize:'1.3rem', fontFamily:'Bebas Neue,cursive', letterSpacing:'0.05em', marginTop:'6px' }}>
                          ₹{booking.totalAmount}
                        </p>
                        <p className="text-xs text-white/30 font-mono mt-1">{booking.bookingNumber}</p>
                        <Link to={`/match-booking/${booking._id}`}
                          className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1 block">
                          View Ticket →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}