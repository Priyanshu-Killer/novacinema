import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const statusConfig = {
  now_showing: { label:'NOW SHOWING', color:'#b8ff00', bg:'rgba(184,255,0,0.12)', border:'rgba(184,255,0,0.3)' },
  nowShowing:  { label:'NOW SHOWING', color:'#b8ff00', bg:'rgba(184,255,0,0.12)', border:'rgba(184,255,0,0.3)' },
  upcoming:    { label:'COMING SOON', color:'#ffaa00', bg:'rgba(255,170,0,0.12)', border:'rgba(255,170,0,0.3)' },
  ended:       { label:'ENDED',       color:'#555',    bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)' },
}

const getStatus = (s) => {
  if (!s) return statusConfig.upcoming
  const n = s.toLowerCase().replace(/[\s_-]/g,'')
  if (['nowshowing','showing','active'].includes(n)) return statusConfig.now_showing
  if (['upcoming','comingsoon'].includes(n))         return statusConfig.upcoming
  if (n === 'ended')                                 return statusConfig.ended
  return statusConfig.upcoming
}

const isNowShowing = (s) => {
  if (!s) return false
  return ['nowshowing','showing','active'].includes(s.toLowerCase().replace(/[\s_-]/g,''))
}

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [tilt, setTilt]         = useState({ x:0, y:0 })
  const cardRef = useRef(null)
  const navigate = useNavigate()

  const status  = getStatus(movie.status)
  const showing = isNowShowing(movie.status)
  const poster  = movie.posterUrl || movie.poster || ''
  const year    = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setTilt({ x: y * 12, y: -x * 12 })
  }

  const handleBook = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/movies/${movie._id}`)
  }

  return (
    <Link to={`/movies/${movie._id}`} className="block" style={{ perspective:'1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x:0, y:0 }) }}
        onMouseMove={handleMouseMove}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: hovered ? 1.03 : 1,
        }}
        transition={{ type:'spring', stiffness:300, damping:20 }}
        style={{
          transformStyle: 'preserve-3d',
          background: 'rgba(10,8,20,0.9)',
          border: `1px solid ${hovered ? 'rgba(102,51,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: hovered
            ? '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(102,51,212,0.2), 0 0 40px rgba(102,51,212,0.1)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Poster */}
        <div style={{ position:'relative', aspectRatio:'2/3', overflow:'hidden' }}>
          {!imgError && poster ? (
            <motion.img
              src={poster}
              alt={movie.title}
              onError={() => setImgError(true)}
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration:0.6, ease:[0.23,1,0.32,1] }}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
          ) : (
            <div style={{
              width:'100%', height:'100%',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg, #0d0a18, #1c1630)',
            }}>
              <span style={{ fontSize:'3rem' }}>🎬</span>
              <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.7rem', fontFamily:'monospace', marginTop:'8px' }}>No Poster</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to top, rgba(10,8,20,0.95) 0%, rgba(10,8,20,0.3) 50%, transparent 100%)',
          }} />

          {/* Top badges */}
          <div style={{ position:'absolute', top:'10px', left:'10px', right:'10px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <motion.span
              animate={{ opacity: hovered ? 1 : 0.85 }}
              style={{
                fontFamily:'JetBrains Mono, monospace', fontSize:'0.55rem', letterSpacing:'0.12em',
                textTransform:'uppercase', padding:'3px 8px', borderRadius:'6px',
                background: status.bg, border:`1px solid ${status.border}`, color: status.color,
              }}>
              {status.label}
            </motion.span>
            {movie.imdbRating > 0 && (
              <span style={{
                fontFamily:'JetBrains Mono, monospace', fontSize:'0.58rem',
                padding:'3px 8px', borderRadius:'6px',
                background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', color:'#fcd34d',
              }}>
                ★ {movie.imdbRating}
              </span>
            )}
          </div>

          {/* Book Now — slides up on hover */}
          <motion.div
            animate={{ y: hovered ? 0 : '100%', opacity: hovered ? 1 : 0 }}
            transition={{ duration:0.3, ease:[0.23,1,0.32,1] }}
            style={{ position:'absolute', bottom:0, left:0, right:0, padding:'32px 10px 12px' }}>
            <motion.button
              onClick={handleBook}
              whileTap={{ scale:0.96 }}
              style={{
                width:'100%', padding:'11px', borderRadius:'10px',
                fontSize:'0.82rem', fontWeight:700, letterSpacing:'0.06em', color:'#fff',
                background: showing
                  ? 'linear-gradient(135deg, #ff2d6b, #d91a55)'
                  : 'linear-gradient(135deg, #6633d4, #4a1fa8)',
                border:'none', cursor:'pointer',
                boxShadow: showing
                  ? '0 4px 20px rgba(255,45,107,0.5)'
                  : '0 4px 20px rgba(102,51,212,0.5)',
              }}>
              {showing ? '🎟 Book Now' : '🔔 Coming Soon'}
            </motion.button>
          </motion.div>

          {/* Shine effect on hover */}
          <motion.div
            animate={{ x: hovered ? '200%' : '-100%', opacity: hovered ? 1 : 0 }}
            transition={{ duration:0.6, ease:'easeInOut' }}
            style={{
              position:'absolute', inset:0,
              background:'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              pointerEvents:'none',
            }}
          />
        </div>

        {/* Info */}
        <div style={{ padding:'12px 14px' }}>
          <h3 style={{
            fontFamily:'Bebas Neue, cursive', fontSize:'0.95rem', letterSpacing:'0.05em',
            color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            marginBottom:'6px',
          }}>
            {movie.title}
          </h3>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.28)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {movie.genre?.slice(0,2).join(' · ')}
            </span>
            {year && <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.18)', flexShrink:0 }}>{year}</span>}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}