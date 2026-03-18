import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import api from '../services/api'
import toast from 'react-hot-toast'
import MatchPaymentModal from '../components/user/MatchPaymentModal'

const sportEmoji = { Cricket: '🏏', Football: '⚽', Basketball: '🏀', Kabaddi: '🤼' }

const STANDS = [
  { id: 'north',   label: 'North Stand',               color: '#f87171', category: 'General', startAngle: -60,  endAngle: 60,  innerR: 195, outerR: 270, rows: 6 },
  { id: 'sunil',   label: 'Sunil Gavaskar Pavilion',   color: '#60a5fa', category: 'Premium', startAngle: 60,   endAngle: 140, innerR: 195, outerR: 280, rows: 8 },
  { id: 'divecha', label: 'Divecha Stand',             color: '#93c5fd', category: 'General', startAngle: 140,  endAngle: 190, innerR: 195, outerR: 255, rows: 5 },
  { id: 'grand',   label: 'Grand Stand',               color: '#fb923c', category: 'General', startAngle: 190,  endAngle: 240, innerR: 195, outerR: 255, rows: 5 },
  { id: 'garware', label: 'Garware Pavilion',          color: '#fbbf24', category: 'Premium', startAngle: 240,  endAngle: 310, innerR: 195, outerR: 280, rows: 8 },
  { id: 'vijay',   label: 'Vijay Merchant Pavilion',   color: '#4ade80', category: 'Premium', startAngle: 310,  endAngle: 360, innerR: 195, outerR: 275, rows: 7 },
  { id: 'sachin',  label: 'Sachin Tendulkar Pavilion', color: '#c084fc', category: 'VIP',     startAngle: -120, endAngle: -60, innerR: 195, outerR: 285, rows: 9 },
  { id: 'mca',     label: 'MCA Pavilion',              color: '#f472b6', category: 'VIP',     startAngle: 115,  endAngle: 145, innerR: 160, outerR: 195, rows: 3 },
  { id: 'boxes',   label: 'Corporate Boxes',           color: '#e2e8f0', category: 'VIP',     startAngle: 155,  endAngle: 195, innerR: 160, outerR: 195, rows: 3 },
]

const CAT_COLORS = {
  General: { bg: '#1e3a1e', accent: '#4ade80', text: '#86efac', glow: 'rgba(74,222,128,0.3)' },
  Premium: { bg: '#1e1e3a', accent: '#818cf8', text: '#a5b4fc', glow: 'rgba(129,140,248,0.3)' },
  VIP:     { bg: '#3a1e0a', accent: '#fbbf24', text: '#fcd34d', glow: 'rgba(251,191,36,0.3)'  },
}

function toRad(d) { return d * Math.PI / 180 }

function arcPath(cx, cy, ir, or_, sd, ed) {
  const s = sd-90, e = ed-90
  const x1=cx+or_*Math.cos(toRad(s)), y1=cy+or_*Math.sin(toRad(s))
  const x2=cx+or_*Math.cos(toRad(e)), y2=cy+or_*Math.sin(toRad(e))
  const x3=cx+ir*Math.cos(toRad(e)),  y3=cy+ir*Math.sin(toRad(e))
  const x4=cx+ir*Math.cos(toRad(s)),  y4=cy+ir*Math.sin(toRad(s))
  const lg = e-s > 180 ? 1 : 0
  return `M${x1} ${y1} A${or_} ${or_} 0 ${lg} 1 ${x2} ${y2} L${x3} ${y3} A${ir} ${ir} 0 ${lg} 0 ${x4} ${y4}Z`
}

function labelPos(cx, cy, ir, or_, sd, ed) {
  const mid = (sd+ed)/2 - 90, r = (ir+or_)/2
  return { x: cx+r*Math.cos(toRad(mid)), y: cy+r*Math.sin(toRad(mid)), rot: (sd+ed)/2 }
}

// Generate seats — first `bookedCount` seats in order are marked booked (reflects real DB state)
function generateSeats(stand, total, bookedCount) {
  const seats = []
  const rowCount = stand.rows
  let seatIndex = 0
  for (let row = 0; row < rowCount; row++) {
    const r = stand.innerR + ((stand.outerR - stand.innerR) / rowCount) * (row + 0.5)
    const arcLen = ((stand.endAngle - stand.startAngle) * Math.PI * r) / 180
    const perRow = Math.max(3, Math.floor(arcLen / 11))
    for (let si = 0; si < perRow; si++) {
      const angleFrac = (si + 0.5) / perRow
      const angle = stand.startAngle + angleFrac * (stand.endAngle - stand.startAngle) - 90
      seats.push({
        id: `${stand.id}-r${row}-s${si}`,
        standId: stand.id,
        category: stand.category,
        row, seatNum: si, r, angle,
        booked: seatIndex < bookedCount  // first N seats are booked in order
      })
      seatIndex++
    }
  }
  return seats
}

// ── Zoomed Stand View ──
function ZoomedStand({ stand, seats, selectedSeats, onToggle, onClose, price, color }) {
  const col = CAT_COLORS[stand.category] || CAT_COLORS.General
  const rows = []
  for (let r = 0; r < stand.rows; r++) {
    rows.push(seats.filter(s => s.row === r))
  }
  const selectedHere = selectedSeats.filter(s => s.standId === stand.id)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0d0a18',
        border: `2px solid ${color}55`,
        borderRadius: '20px',
        width: '100%', maxWidth: '680px',
        maxHeight: '90vh', overflow: 'hidden',
        boxShadow: `0 0 60px ${col.glow}`,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${color}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${color}15` }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{stand.label}</h3>
            <p style={{ color: col.text, fontSize: '0.75rem', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
              {stand.category} · ₹{price} per seat
              {selectedHere.length > 0 && <span style={{ marginLeft: '8px', background: '#ff2d6b', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>{selectedHere.length} selected</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Field indicator */}
        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(74,222,128,0.05)' }}>
          <div style={{ display: 'inline-block', padding: '4px 24px', borderRadius: '20px', border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.1)' }}>
            <span style={{ color: '#4ade80', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>▼ PLAYING FIELD ▼</span>
          </div>
        </div>

        {/* Seats grid */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', justifyContent: 'center' }}>
            {[
              { label: 'Available', bg: color, opacity: 0.8 },
              { label: 'Selected',  bg: '#ff2d6b', opacity: 1 },
              { label: 'Booked',    bg: '#374151', opacity: 0.4 },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '12px', borderRadius: '3px 3px 0 0', background: l.bg, opacity: l.opacity, border: '1px solid rgba(255,255,255,0.2)' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontFamily: 'JetBrains Mono' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Rows — row 0 = closest to field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rows.map((rowSeats, ri) => (
              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontFamily: 'monospace', width: '20px', textAlign: 'right', flexShrink: 0 }}>{String.fromCharCode(65+ri)}</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
                  {rowSeats.map((seat, si) => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id)
                    const isBooked   = seat.booked
                    return (
                      <motion.button
                        key={seat.id}
                        whileTap={!isBooked ? { scale: 0.85 } : {}}
                        onClick={() => !isBooked && onToggle(seat)}
                        title={isBooked ? 'Already booked' : `Row ${String.fromCharCode(65+ri)}, Seat ${si+1}`}
                        style={{
                          width: '22px', height: '18px',
                          borderRadius: '4px 4px 0 0',
                          border: `1px solid ${isBooked ? '#374151' : isSelected ? '#ff2d6b' : color+'88'}`,
                          background: isBooked ? '#1f2937' : isSelected ? '#ff2d6b' : color,
                          opacity: isBooked ? 0.25 : isSelected ? 1 : 0.75,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          boxShadow: isSelected ? `0 0 8px #ff2d6b88` : 'none',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      />
                    )
                  })}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontFamily: 'monospace', width: '20px', flexShrink: 0 }}>{String.fromCharCode(65+ri)}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', textAlign: 'center', marginTop: '12px', fontFamily: 'JetBrains Mono' }}>
            {seats.filter(s=>!s.booked).length} seats available · {selectedHere.length} selected
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <div>
            {selectedHere.length > 0
              ? <p style={{ color: '#fff', fontWeight: 700 }}>{selectedHere.length} seat{selectedHere.length>1?'s':''} · <span style={{ color: col.accent }}>₹{selectedHere.length * price}</span></p>
              : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Click seats to select</p>
            }
          </div>
          <button onClick={onClose} style={{
            padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
            background: selectedHere.length > 0 ? 'linear-gradient(135deg,#ff2d6b,#d91a55)' : 'rgba(255,255,255,0.1)',
            border: 'none', color: '#fff', cursor: 'pointer',
            boxShadow: selectedHere.length > 0 ? '0 4px 16px rgba(255,45,107,0.4)' : 'none',
          }}>
            {selectedHere.length > 0 ? '✓ Done' : 'Close'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Overview Stadium SVG ──
function StadiumOverview({ stands, selectedSeats, onStandClick, hoveredStand, onStandHover, getPrice }) {
  const CX = 300, CY = 300
  return (
    <svg viewBox="0 0 600 600" style={{ width: '100%', maxWidth: '520px', margin: '0 auto', display: 'block' }}>
      <defs>
        <radialGradient id="fg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#166534" stopOpacity="0.45"/>
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={265} fill="rgba(0,0,0,0.5)" />
      {stands.map(stand => {
        const isHov = hoveredStand === stand.id
        const selCount = selectedSeats.filter(s => s.standId === stand.id).length
        const pos = labelPos(CX, CY, stand.innerR*0.88, stand.outerR*0.88, stand.startAngle, stand.endAngle)
        return (
          <g key={stand.id}>
            <path
              d={arcPath(CX, CY, stand.innerR*0.88, stand.outerR*0.88, stand.startAngle, stand.endAngle)}
              fill={stand.color} fillOpacity={isHov ? 1 : 0.72}
              stroke={isHov ? '#fff' : 'rgba(0,0,0,0.6)'} strokeWidth={isHov ? 2 : 1.5}
              style={{ cursor: 'pointer', transition: 'all 0.2s', filter: isHov ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none' }}
              onClick={() => onStandClick(stand.id)}
              onMouseEnter={() => onStandHover(stand.id)}
              onMouseLeave={() => onStandHover(null)}
            />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="6.5" fontWeight="700" fill="rgba(0,0,0,0.85)" fontFamily="JetBrains Mono, monospace"
              transform={`rotate(${pos.rot},${pos.x},${pos.y})`} style={{ pointerEvents:'none', userSelect:'none' }}>
              {stand.label.length>16 ? stand.label.slice(0,14)+'…' : stand.label}
            </text>
            {/* price */}
            <text x={pos.x} y={pos.y+9} textAnchor="middle" dominantBaseline="middle"
              fontSize="5.5" fontWeight="600" fill="rgba(0,0,0,0.7)" fontFamily="JetBrains Mono, monospace"
              transform={`rotate(${pos.rot},${pos.x},${pos.y+9})`} style={{ pointerEvents:'none', userSelect:'none' }}>
              ₹{getPrice(stand.category)}
            </text>
            {/* selection badge */}
            {selCount > 0 && (() => {
              const bp = labelPos(CX, CY, stand.innerR*0.88+8, stand.outerR*0.88-8, stand.startAngle, stand.endAngle)
              return (
                <g style={{ pointerEvents:'none' }}>
                  <circle cx={bp.x} cy={bp.y-14} r={9} fill="#ff2d6b" />
                  <text x={bp.x} y={bp.y-14} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="900" fill="white" fontFamily="monospace">{selCount}</text>
                </g>
              )
            })()}
          </g>
        )
      })}
      {/* Field */}
      <ellipse cx={CX} cy={CY} rx={160} ry={160} fill="url(#fg)" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.3" />
      <ellipse cx={CX} cy={CY} rx={136} ry={136} fill="none" stroke="#4ade80" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="4 4" />
      <rect x={CX-10} y={CY-40} width={20} height={80} rx="3" fill="#d97706" fillOpacity="0.85" stroke="#f59e0b" strokeWidth="1" />
      <line x1={CX-8} y1={CY-25} x2={CX+8} y2={CY-25} stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5" />
      <line x1={CX-8} y1={CY+25} x2={CX+8} y2={CY+25} stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5" />
      <text x={CX} y={CY+3} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fcd34d" fontFamily="JetBrains Mono, monospace" letterSpacing="2" style={{ userSelect:'none' }}>PITCH</text>
      {/* Tap instruction */}
      <text x={CX} y={CY-18} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.2)" fontFamily="JetBrains Mono, monospace" style={{ userSelect:'none' }}>TAP A STAND</text>
      <text x={CX} y={CY-7} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.2)" fontFamily="JetBrains Mono, monospace" style={{ userSelect:'none' }}>TO SELECT SEATS</text>
    </svg>
  )
}

export default function MatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(s => s.auth)

  const [match, setMatch]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [seatData, setSeatData]     = useState({})
  const [selectedSeats, setSelectedSeats] = useState([])
  const [zoomedStand, setZoomedStand] = useState(null)
  const [hoveredStand, setHoveredStand] = useState(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    api.get(`/matches/${id}`).then(res => {
      const m = res.data.match
      setMatch(m)
      const data = {}
      // Count stands per category to distribute booked seats evenly
      const standsByCategory = {}
      STANDS.forEach(s => {
        standsByCategory[s.category] = (standsByCategory[s.category] || 0) + 1
      })
      STANDS.forEach(stand => {
        const cat         = m.ticketCategories?.find(c => c.name === stand.category)
        const totalSeats  = cat?.totalSeats || 200
        const bookedSeats = cat?.bookedSeats || 0
        const standsInCat = standsByCategory[stand.category] || 1
        // Distribute seats across stands of same category
        const seatsPerStand  = Math.ceil(totalSeats / standsInCat)
        const bookedPerStand = Math.ceil(bookedSeats / standsInCat)
        data[stand.id] = generateSeats(stand, seatsPerStand, bookedPerStand)
      })
      setSeatData(data)
    }).catch(() => { toast.error('Match not found'); navigate('/matches') })
    .finally(() => setLoading(false))
  }, [id])

  const getPrice = (cat) => match?.ticketCategories?.find(c => c.name === cat)?.price || 0

  const handleToggle = (seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id)
      if (exists) return prev.filter(s => s.id !== seat.id)
      if (prev.length >= 10) { toast.error('Max 10 seats'); return prev }
      return [...prev, seat]
    })
  }

  const totalAmount = selectedSeats.reduce((sum, s) => sum + getPrice(s.category), 0)
  const grouped = selectedSeats.reduce((acc, s) => { acc[s.category]=(acc[s.category]||0)+1; return acc }, {})

  const handleBook = async (method, cardDetails) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/matches/${id}` } }); return }
    if (!selectedSeats.length) return toast.error('Select seats first')
    const tickets = Object.entries(grouped).map(([category, quantity]) => ({ category, quantity }))
    const res = await api.post(`/matches/${id}/book`, { tickets })
    return res.data.booking
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin" /></div>
  if (!match) return null

  const matchDate = new Date(match.matchDate)
  const zStand = STANDS.find(s => s.id === zoomedStand)

  return (
    <div className="min-h-screen pt-16 pb-24" style={{ background: '#030206' }}>

      {/* Hero */}
      <div className="relative h-[28vh] overflow-hidden">
        <div className="absolute inset-0" style={{ background: match.bannerUrl ? `url(${match.bannerUrl}) center/cover` : 'linear-gradient(135deg,#0d0520,#1a0a3d,#0a1a0d)' }} />
        {match.bannerUrl && <div className="absolute inset-0 bg-black/55" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030206] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span>{sportEmoji[match.sport]||'🏆'}</span>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{match.format}</span>
              {match.status==='live' && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">● LIVE</span>}
            </div>
            <div className="flex items-center gap-4">
              <TeamBadge name={match.team1} logo={match.team1Logo} />
              <span style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.5rem', color:'#b8ff00' }}>VS</span>
              <TeamBadge name={match.team2} logo={match.team2Logo} />
            </div>
            <p className="text-white/30 text-xs mt-1 font-mono">📍 {match.venue} · {matchDate.toLocaleDateString('en-IN',{day:'numeric',month:'short'})} · {match.matchTime}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Stadium Overview */}
          <div className="xl:col-span-2">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-sm">🏟 Select a Stand</h2>
                <span className="text-white/30 text-xs font-mono">{selectedSeats.length}/10 seats selected</span>
              </div>

              <p className="text-white/30 text-xs text-center mb-3 font-mono tracking-wider">
                TAP ANY COLOURED STAND → ZOOM IN → PICK SEATS
              </p>

              <StadiumOverview
                stands={STANDS}
                selectedSeats={selectedSeats}
                onStandClick={setZoomedStand}
                hoveredStand={hoveredStand}
                onStandHover={setHoveredStand}
                getPrice={getPrice}
              />

              {/* Stand buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {STANDS.map(stand => {
                  const col = CAT_COLORS[stand.category] || CAT_COLORS.General
                  const selCount = selectedSeats.filter(s => s.standId === stand.id).length
                  return (
                    <button key={stand.id} onClick={() => setZoomedStand(stand.id)}
                      style={{
                        padding: '8px 10px', borderRadius: '10px', textAlign: 'left',
                        background: selCount > 0 ? `${stand.color}25` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selCount > 0 ? stand.color+'66' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: stand.color, flexShrink: 0 }} />
                        <span style={{ color: selCount>0?'#fff':'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.2 }}>{stand.label}</span>
                        {selCount > 0 && <span style={{ marginLeft:'auto', background:'#ff2d6b', color:'#fff', borderRadius:'4px', padding:'1px 5px', fontSize:'0.6rem', fontWeight:700, flexShrink:0 }}>{selCount}</span>}
                      </div>
                      <div style={{ color: col.text, fontSize: '0.62rem', fontFamily:'JetBrains Mono,monospace', marginTop: '2px', paddingLeft: '14px' }}>
                        {stand.category} · ₹{getPrice(stand.category)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
              className="glass rounded-2xl p-5 border border-white/10 sticky top-24">
              <h3 className="text-white font-bold mb-0.5 text-sm">Booking Summary</h3>
              <p className="text-white/30 text-xs mb-4 font-mono">{selectedSeats.length} / 10 seats</p>

              {selectedSeats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🏟️</div>
                  <p className="text-white/25 text-xs leading-relaxed">
                    1. Tap a stand on the map<br/>
                    2. Stand zooms in<br/>
                    3. Click seats to select<br/>
                    4. Tap Done → Confirm
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {Object.entries(grouped).map(([cat, count]) => {
                    const price = getPrice(cat)
                    const col = CAT_COLORS[cat] || CAT_COLORS.General
                    return (
                      <div key={cat} style={{ padding:'10px 12px', borderRadius:'10px', background:col.bg, border:`1px solid ${col.accent}33` }}>
                        <div className="flex justify-between text-sm">
                          <span style={{color:col.text, fontWeight:600}}>{cat}</span>
                          <span className="text-white/50">{count} seat{count>1?'s':''}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-white/25">₹{price} × {count}</span>
                          <span className="text-white font-semibold">₹{price*count}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex justify-between font-bold pt-3 border-t border-white/10">
                    <span className="text-white/60 text-sm">Total</span>
                    <span style={{color:'#b8ff00', fontSize:'1.3rem', fontFamily:'Bebas Neue,cursive', letterSpacing:'0.05em'}}>₹{totalAmount}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => { if(!isAuthenticated){ navigate('/login',{state:{from:`/matches/${id}`}}); return } if(selectedSeats.length>0) setShowPayment(true) }}
                disabled={selectedSeats.length === 0}
                style={{
                  width:'100%', padding:'13px', borderRadius:'12px',
                  fontSize:'0.88rem', fontWeight:700, letterSpacing:'0.04em', color:'#fff',
                  background: selectedSeats.length>0 ? 'linear-gradient(135deg,#ff2d6b,#d91a55)' : 'rgba(255,255,255,0.06)',
                  border:`1px solid ${selectedSeats.length>0 ? '#ff2d6b44' : 'rgba(255,255,255,0.08)'}`,
                  cursor: selectedSeats.length>0 ? 'pointer' : 'not-allowed',
                  boxShadow: selectedSeats.length>0 ? '0 4px 24px rgba(255,45,107,0.35)' : 'none',
                  transition:'all 0.2s',
                }}>
                {selectedSeats.length>0 ? `🎟 Book ${selectedSeats.length} Seat${selectedSeats.length>1?'s':''} · ₹${totalAmount}` : 'Select Seats to Book'}
              </button>

              {selectedSeats.length > 0 && (
                <button onClick={() => setSelectedSeats([])} className="w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors mt-2 py-1">
                  ✕ Clear all seats
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ZOOMED STAND MODAL */}
      <AnimatePresence>
        {zoomedStand && zStand && (
          <ZoomedStand
            stand={zStand}
            seats={seatData[zoomedStand] || []}
            selectedSeats={selectedSeats}
            onToggle={handleToggle}
            onClose={() => setZoomedStand(null)}
            price={getPrice(zStand.category)}
            color={zStand.color}
          />
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <MatchPaymentModal
            match={match}
            totalAmount={totalAmount}
            grouped={grouped}
            getPrice={getPrice}
            onClose={() => setShowPayment(false)}
            onSuccess={(bookingId) => navigate(`/match-booking/${bookingId}`)}
            handleBook={handleBook}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TeamBadge({ name, logo }) {
  return (
    <div className="flex items-center gap-2">
      {logo ? <img src={logo} alt={name} style={{width:'36px',height:'36px',objectFit:'contain'}}/> : <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6633d4,#ff2d6b)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'1rem'}}>{name?.[0]}</div>}
      <p style={{fontFamily:'Bebas Neue,cursive',fontSize:'1.3rem',color:'#fff',letterSpacing:'0.05em'}}>{name}</p>
    </div>
  )
}