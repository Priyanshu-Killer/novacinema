import React from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

export default function BookingSummary({ show, movie, onProceed, loading }) {
  const { selectedSeats } = useSelector(s => s.booking)

  if (!selectedSeats.length) return null

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const convenienceFee = Math.round(subtotal * 0.05)
  const total = subtotal + convenienceFee

  const groupedByType = selectedSeats.reduce((acc, seat) => {
    if (!acc[seat.seatType]) acc[seat.seatType] = { count: 0, price: seat.price }
    acc[seat.seatType].count++
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-2xl p-6 border border-nova-600/30 sticky top-24"
    >
      <h3 className="font-display text-lg font-bold text-white mb-4">Booking Summary</h3>

      {/* Movie info */}
      <div className="flex gap-3 mb-4 pb-4 border-b border-nova-700/30">
        <div className="text-2xl">🎬</div>
        <div>
          <p className="font-semibold text-white text-sm">{movie?.title}</p>
          <p className="text-xs text-nova-400 mt-0.5">{show?.theatre?.name}</p>
          <p className="text-xs text-nova-400">{show?.showDate ? new Date(show.showDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} · {show?.showTime}</p>
          <p className="text-xs text-cyan-400 mt-1">{show?.format} · {show?.language}</p>
        </div>
      </div>

      {/* Seats */}
      <div className="mb-4 pb-4 border-b border-nova-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-nova-400">Seats</span>
          <span className="text-xs text-nova-500 font-mono">{selectedSeats.map(s => `${s.row}${s.seatNumber}`).join(', ')}</span>
        </div>
        {Object.entries(groupedByType).map(([type, { count, price }]) => (
          <div key={type} className="flex justify-between text-sm mt-1">
            <span className="text-nova-300 capitalize">{type} × {count}</span>
            <span className="text-white font-mono">₹{price * count}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-nova-400">Subtotal</span>
          <span className="text-white font-mono">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-nova-400">Convenience Fee (5%)</span>
          <span className="text-white font-mono">₹{convenienceFee}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-nova-700/30 pt-2 mt-2">
          <span className="text-white">Total</span>
          <span className="text-gradient-gold font-display text-lg">₹{total}</span>
        </div>
      </div>

      <button
        onClick={onProceed}
        disabled={loading || selectedSeats.length === 0}
        className="nova-btn-cyan w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Proceed to Pay · ₹${total}`}
      </button>

      <p className="text-xs text-nova-500 text-center mt-3">Seats are locked for 10 minutes after selection</p>
    </motion.div>
  )
}
