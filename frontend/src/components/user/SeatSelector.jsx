import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSeat } from '../../store/slices/bookingSlice'

const SEAT_SIZE = 28
const SEAT_GAP = 4

const seatTypeColors = {
  available: {
    standard: '#3d2d68',
    premium: '#5b44a0',
    recliner: '#b59049'
  },
  selected: '#22d3ee',
  booked: '#1d1530',
  locked: '#78716c'
}

function SeatSVG({ seat, isSelected, onClick }) {
  const getColor = () => {
    if (seat.status === 'booked') return { fill: seatTypeColors.booked, stroke: '#2a1f45' }
    if (seat.status === 'locked') return { fill: seatTypeColors.locked, stroke: '#a87e3a' }
    if (isSelected) return { fill: seatTypeColors.selected, stroke: '#67e8f9' }
    return { fill: seatTypeColors.available[seat.seatType] || seatTypeColors.available.standard, stroke: '#8b6fd4' }
  }

  const { fill, stroke } = getColor()
  const isClickable = seat.status === 'available' || isSelected

  return (
    <motion.svg
      width={SEAT_SIZE}
      height={SEAT_SIZE}
      className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.2 } : {}}
      whileTap={isClickable ? { scale: 0.9 } : {}}
      title={`${seat.row}${seat.seatNumber} - ${seat.seatType} - ₹${seat.price}`}
    >
      {/* Seat shape */}
      <rect x="3" y="6" width={SEAT_SIZE - 6} height={SEAT_SIZE - 10} rx="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Backrest */}
      <rect x="5" y="2" width={SEAT_SIZE - 10} height="6" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Selected glow */}
      {isSelected && (
        <rect x="3" y="6" width={SEAT_SIZE - 6} height={SEAT_SIZE - 10} rx="4" fill="transparent" stroke="#22d3ee" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
        </rect>
      )}
    </motion.svg>
  )
}

export default function SeatSelector({ show }) {
  const dispatch = useDispatch()
  const { selectedSeats } = useSelector(s => s.booking)

  const handleSeatClick = useCallback((seat) => {
    if (seat.status !== 'available') return
    dispatch(toggleSeat({ row: seat.row, seatNumber: seat.seatNumber, seatType: seat.seatType, price: seat.price }))
  }, [dispatch])

  if (!show?.seats?.length) return <div className="text-nova-400 text-center py-8">No seat data available</div>

  // Group seats by row
  const rows = {}
  show.seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = []
    rows[seat.row].push(seat)
  })

  const sortedRows = Object.keys(rows).sort()
  const maxSeatsInRow = Math.max(...sortedRows.map(r => rows[r].length))

  const isSelected = (seat) => selectedSeats.some(s => s.row === seat.row && s.seatNumber === seat.seatNumber)

  // Determine seat type categories by row
  const getRowCategory = (rowKey) => {
    const firstSeat = rows[rowKey][0]
    return firstSeat?.seatType || 'standard'
  }

  const categoryLabels = { recliner: '⭐ Recliner', premium: '✦ Premium', standard: '◈ Standard' }
  const categoryPrices = { recliner: show.pricing?.recliner, premium: show.pricing?.premium, standard: show.pricing?.standard }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Screen */}
      <div className="w-full max-w-lg">
        <div className="relative h-8 mx-8 mb-2">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 to-transparent rounded-t-full" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>
        <p className="text-center text-xs text-nova-500 font-mono tracking-widest">SCREEN</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        {[
          { color: '#3d2d68', label: 'Standard', price: show.pricing?.standard },
          { color: '#5b44a0', label: 'Premium', price: show.pricing?.premium },
          { color: '#b59049', label: 'Recliner', price: show.pricing?.recliner },
          { color: '#22d3ee', label: 'Selected', price: null },
          { color: '#1d1530', label: 'Booked', price: null, border: '#2a1f45' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm border" style={{ backgroundColor: item.color, borderColor: item.border || item.color }} />
            <span className="text-nova-400">{item.label}{item.price ? ` ₹${item.price}` : ''}</span>
          </div>
        ))}
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-4 w-full">
        <div className="flex flex-col items-center gap-1 min-w-max mx-auto">
          {sortedRows.map((rowKey, rowIdx) => {
            const rowSeats = rows[rowKey].sort((a, b) => a.seatNumber - b.seatNumber)
            const category = getRowCategory(rowKey)
            
            // Show category header when category changes
            const prevCategory = rowIdx > 0 ? getRowCategory(sortedRows[rowIdx - 1]) : null
            const showCategoryHeader = category !== prevCategory

            return (
              <React.Fragment key={rowKey}>
                {showCategoryHeader && (
                  <div className="flex items-center gap-2 my-2 w-full justify-center">
                    <div className="h-px bg-nova-700/50 flex-1 max-w-20" />
                    <span className="text-xs text-nova-400 font-mono px-2">{categoryLabels[category]} — ₹{categoryPrices[category]}</span>
                    <div className="h-px bg-nova-700/50 flex-1 max-w-20" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-nova-500 font-mono w-4 text-right">{rowKey}</span>
                  <div className="flex gap-1">
                    {rowSeats.map(seat => (
                      <SeatSVG
                        key={`${seat.row}-${seat.seatNumber}`}
                        seat={seat}
                        isSelected={isSelected(seat)}
                        onClick={() => handleSeatClick(seat)}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-nova-500 font-mono w-4">{rowKey}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
