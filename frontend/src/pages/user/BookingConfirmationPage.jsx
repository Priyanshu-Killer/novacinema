import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'

export default function BookingConfirmationPage() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`)
        setBooking(res.data.booking)
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    fetchBooking()
  }, [bookingId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin" /></div>
  if (!booking) return <div className="min-h-screen pt-24 text-center"><p className="text-nova-400">Booking not found</p></div>

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-lg mx-auto">
        {/* Success animation */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 120 }}
          className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto mb-4 text-4xl glow-cyan">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Booking Confirmed!</h1>
          <p className="text-nova-400 text-sm mt-2">Your tickets have been booked successfully</p>
        </motion.div>

        {/* Ticket card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-dark rounded-2xl border border-nova-600/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-nova-700 to-nova-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-display font-black text-lg text-white">NOVA<span className="text-gradient">CINEMA</span></p>
                <p className="font-mono text-xs text-nova-300 mt-1">{booking.bookingId}</p>
              </div>
              {booking.qrCode && (
                <img src={booking.qrCode} alt="QR" className="w-20 h-20 bg-white p-1 rounded-lg" />
              )}
            </div>
          </div>

          {/* Ticket details */}
          <div className="p-6 space-y-4">
            <div>
              <p className="font-display text-xl font-bold text-white">{booking.movie?.title}</p>
              <p className="text-nova-400 text-sm">{booking.theatre?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Date', booking.showDate],
                ['Time', booking.showTime],
                ['Format', '2D'],
                ['Seats', booking.seats?.map(s => `${s.row}${s.seatNumber}`).join(', ')]
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-nova-500 font-mono">{label}</p>
                  <p className="text-white text-sm font-semibold mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-nova-700/50 my-2 relative">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-nova-950" />
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-nova-950" />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-nova-500">Total Paid</p>
                <p className="font-display text-2xl font-bold text-gradient-gold">₹{booking.finalAmount}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-mono border ${
                booking.status === 'confirmed' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'
              }`}>
                {booking.status?.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6">
          <Link to="/my-bookings" className="nova-btn-outline flex-1 text-center">View All Bookings</Link>
          <Link to="/movies" className="nova-btn-primary flex-1 text-center">Book More</Link>
        </div>
      </div>
    </div>
  )
}
