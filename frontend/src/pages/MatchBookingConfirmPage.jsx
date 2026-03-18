import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'

export default function MatchBookingConfirmPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/matches/bookings/${id}`)
      .then(res => setBooking(res.data.booking))
      .catch(() => navigate('/matches'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin" />
    </div>
  )

  if (!booking) return null
  const match = booking.match
  const matchDate = match?.matchDate ? new Date(match.matchDate) : null

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md">

        {/* Success */}
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-3">🎉</motion.div>
          <h1 className="text-white text-2xl font-bold">Booking Confirmed!</h1>
          <p className="text-white/50 text-sm mt-1">Your tickets are ready</p>
        </div>

        {/* Ticket */}
        <div style={{
          background: 'rgba(13,10,24,0.95)',
          border: '1px solid rgba(102,51,212,0.4)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(102,51,212,0.2)',
        }}>
          {/* Top */}
          <div style={{ background: 'linear-gradient(135deg, #1a0a3d, #0d1520)', padding: '20px' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-white/40 tracking-widest">MATCH TICKET</span>
              <span style={{ color: '#b8ff00', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{booking.bookingNumber}</span>
            </div>
            <div className="flex items-center justify-center gap-4 py-2">
              <p style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '1.8rem', color: '#fff' }}>{match?.team1}</p>
              <p style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '1.2rem', color: '#b8ff00' }}>VS</p>
              <p style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '1.8rem', color: '#fff' }}>{match?.team2}</p>
            </div>
          </div>

          {/* Dashed divider */}
          <div style={{ borderTop: '2px dashed rgba(255,255,255,0.1)', margin: '0 16px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-28px', top: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: '#030206' }} />
            <div style={{ position: 'absolute', right: '-28px', top: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: '#030206' }} />
          </div>

          {/* Details */}
          <div style={{ padding: '20px' }}>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {[
                ['Venue',  match?.venue],
                ['Date',   matchDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                ['Time',   match?.matchTime],
                ['Sport',  match?.sport],
              ].filter(([,v]) => v).map(([label, val]) => (
                <div key={label}>
                  <p className="text-white/30 text-xs mb-0.5">{label}</p>
                  <p className="text-white/80 text-sm">{val}</p>
                </div>
              ))}
            </div>

            {/* Tickets */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              {booking.tickets?.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/60">{t.category} × {t.quantity}</span>
                  <span className="text-white">₹{t.price * t.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                <span className="text-white/80">Total Paid</span>
                <span style={{ color: '#b8ff00', fontSize: '1.1rem' }}>₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link to="/matches" className="nova-btn-outline flex-1 text-center text-sm">Browse Matches</Link>
          <Link to="/my-bookings" className="nova-btn-cyan flex-1 text-center text-sm">My Bookings</Link>
        </div>
      </motion.div>
    </div>
  )
}