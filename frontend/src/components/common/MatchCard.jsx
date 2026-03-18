import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const sportEmoji = { Cricket:'🏏', Football:'⚽', Basketball:'🏀', Kabaddi:'🤼' }
const statusConfig = {
  upcoming:  { label:'UPCOMING', color:'#b8ff00', bg:'rgba(184,255,0,0.1)',   border:'rgba(184,255,0,0.28)' },
  live:      { label:'● LIVE',   color:'#ff2d6b', bg:'rgba(255,45,107,0.15)', border:'rgba(255,45,107,0.4)' },
  completed: { label:'ENDED',    color:'#555',    bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)' },
  cancelled: { label:'CANCELLED',color:'#555',    bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)' },
}

export default function MatchCard({ match }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt]       = useState({ x:0, y:0 })
  const cardRef = useRef(null)
  const navigate = useNavigate()

  const status   = statusConfig[match.status] || statusConfig.upcoming
  const date     = match.matchDate ? new Date(match.matchDate) : null
  const minPrice = match.ticketCategories?.length ? Math.min(...match.ticketCategories.map(c=>c.price)) : null
  const isLive   = match.status === 'live'
  const canBook  = match.status === 'upcoming' || isLive

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setTilt({ x: y * 10, y: -x * 10 })
  }

  return (
    <div style={{ perspective:'1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({x:0,y:0}) }}
        onMouseMove={handleMouseMove}
        onClick={() => navigate(`/matches/${match._id}`)}
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: hovered ? 1.03 : 1 }}
        transition={{ type:'spring', stiffness:300, damping:20 }}
        style={{
          transformStyle:'preserve-3d',
          background:'rgba(10,8,20,0.95)',
          border:`1px solid ${hovered ? 'rgba(102,51,212,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius:'16px', overflow:'hidden', cursor:'pointer',
          boxShadow: hovered
            ? '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(102,51,212,0.1)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition:'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Banner */}
        <div style={{
          position:'relative',
          background: match.bannerUrl
            ? `url(${match.bannerUrl}) center/cover`
            : 'linear-gradient(135deg, #0d0520 0%, #1a0a3d 50%, #0d1520 100%)',
          minHeight:'140px', padding:'12px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          {match.bannerUrl && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)'}} />}

          {/* Top */}
          <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{
              fontFamily:'JetBrains Mono,monospace', fontSize:'0.55rem', letterSpacing:'0.12em',
              padding:'3px 8px', borderRadius:'6px', textTransform:'uppercase',
              background:status.bg, border:`1px solid ${status.border}`, color:status.color,
            }}>
              {isLive ? (
                <motion.span animate={{opacity:[1,0.4,1]}} transition={{duration:1,repeat:Infinity}}>
                  {status.label}
                </motion.span>
              ) : status.label}
            </span>
            <span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.5)',background:'rgba(0,0,0,0.4)',padding:'3px 8px',borderRadius:'6px'}}>
              {sportEmoji[match.sport]||'🏆'} {match.format||match.sport}
            </span>
          </div>

          {/* Teams */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', padding:'8px 0' }}>
            <TeamAvatar name={match.team1} logo={match.team1Logo} color="#6633d4" />
            <motion.p animate={{ scale: hovered ? [1,1.05,1] : 1 }} transition={{ duration:1, repeat: hovered ? Infinity : 0 }}
              style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.2rem', color:'#b8ff00', letterSpacing:'0.1em' }}>VS</motion.p>
            <TeamAvatar name={match.team2} logo={match.team2Logo} color="#ff2d6b" />
          </div>
        </div>

        {/* Info */}
        <div style={{ padding:'12px 14px' }}>
          <p style={{ color:'#fff', fontWeight:600, fontSize:'0.82rem', marginBottom:'5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {match.title}
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.68rem' }}>📍 {match.venue}</p>
            {date && <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', fontFamily:'JetBrains Mono,monospace', flexShrink:0 }}>
              {date.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
            </p>}
          </div>

          {/* Button */}
          <motion.div animate={{ height: hovered ? 'auto' : 0, opacity: hovered ? 1 : 0 }} style={{ overflow:'hidden' }}>
            <motion.button
              onClick={e => { e.stopPropagation(); navigate(`/matches/${match._id}`) }}
              whileTap={{ scale:0.97 }}
              style={{
                width:'100%', padding:'10px', borderRadius:'10px', marginBottom:'2px',
                fontSize:'0.82rem', fontWeight:700, letterSpacing:'0.06em', color:'#fff',
                background: canBook
                  ? 'linear-gradient(135deg, #ff2d6b, #d91a55)'
                  : 'rgba(255,255,255,0.1)',
                border:'none', cursor:'pointer',
                boxShadow: canBook ? '0 4px 20px rgba(255,45,107,0.4)' : 'none',
              }}>
              {canBook ? `🎟 Book Now${minPrice ? ` · ₹${minPrice}` : ''}` : match.status==='live' ? '● Live Now' : 'View Details'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function TeamAvatar({ name, logo, color }) {
  return (
    <div style={{ textAlign:'center', flex:1 }}>
      {logo ? (
        <img src={logo} alt={name} style={{ width:'40px', height:'40px', objectFit:'contain', margin:'0 auto 4px' }} />
      ) : (
        <div style={{
          width:'40px', height:'40px', borderRadius:'50%', margin:'0 auto 4px',
          background:`linear-gradient(135deg, ${color}, ${color}88)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1rem', fontWeight:700, color:'#fff',
        }}>
          {name?.[0]}
        </div>
      )}
      <p style={{ color:'#fff', fontWeight:700, fontSize:'0.75rem', fontFamily:'Bebas Neue,cursive', letterSpacing:'0.05em' }}>{name}</p>
    </div>
  )
}