import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovies, clearMovies } from '../store/slices/movieSlice'
import MovieCard from '../components/common/MovieCard'
import MatchCard from '../components/common/MatchCard'
import { SkeletonCard } from '../components/common/Skeleton'
import api from '../services/api'

const isNowShowing = (s) => s && ['nowshowing','showing','active'].includes(s.toLowerCase().replace(/[\s_-]/g,''))
const isUpcoming   = (s) => s && ['upcoming','comingsoon'].includes(s.toLowerCase().replace(/[\s_-]/g,''))

// ── Floating orb ──
const Orb = ({ x, y, size, color, delay }) => (
  <motion.div
    style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width:size, height:size, borderRadius:'50%', background:color, filter:'blur(80px)', opacity:0.35, pointerEvents:'none' }}
    animate={{ x:[0,30,-20,0], y:[0,-20,15,0], scale:[1,1.1,0.9,1] }}
    transition={{ duration:12+delay, repeat:Infinity, ease:'easeInOut', delay }}
  />
)

// ── Animated counter ──
function Counter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseInt(value)
    if (isNaN(num)) return
    let start = 0
    const step = num / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000/60)
    return () => clearInterval(timer)
  }, [value])
  return <span>{count}{value.includes('+') ? '+' : ''}{value.includes('★') ? '★' : ''}</span>
}

// ── Section header ──
const SectionHeader = ({ dot, dotColor, label, title, linkTo }) => (
  <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
    className="flex items-end justify-between mb-8">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} style={{background: dotColor.includes('cyan') ? '#22d3ee' : dotColor.includes('yellow') ? '#fbbf24' : '#4ade80'}} />
        <span className="label text-white/40">{label}</span>
      </div>
      <h2 className="section-heading">{title}</h2>
    </div>
    <Link to={linkTo} className="nova-btn-outline text-xs py-2 px-4 hidden sm:flex items-center gap-2 group">
      View All
      <motion.span animate={{ x:[0,4,0] }} transition={{ repeat:Infinity, duration:1.5 }}>→</motion.span>
    </Link>
  </motion.div>
)

// ── Movie grid ──
const MovieGrid = ({ movies, loading, skeletonCount=8, emptyMsg }) => {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
      {Array(skeletonCount).fill(0).map((_,i) => <SkeletonCard key={i} />)}
    </div>
  )
  if (!movies.length) return (
    <div className="text-center py-12 glass rounded-2xl">
      <div className="text-5xl mb-3">🎬</div>
      <p className="text-white/40">{emptyMsg}</p>
    </div>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
      {movies.map((movie, i) => (
        <motion.div key={movie._id}
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ delay: i*0.06, duration:0.4 }}>
          <MovieCard movie={movie} index={i} />
        </motion.div>
      ))}
    </div>
  )
}

const MatchGrid = ({ matches, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array(4).fill(0).map((_,i) => (
        <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{height:'260px'}} />
      ))}
    </div>
  )
  if (!matches.length) return (
    <div className="text-center py-12 glass rounded-2xl">
      <div className="text-5xl mb-3">🏏</div>
      <p className="text-white/40">No upcoming matches. Check back soon!</p>
    </div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {matches.map((match, i) => (
        <motion.div key={match._id}
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ delay: i*0.07, duration:0.4 }}>
          <MatchCard match={match} />
        </motion.div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const dispatch = useDispatch()
  const { movies, loading } = useSelector(s => s.movies)
  const [matches, setMatches]             = useState([])
  const [matchesLoading, setMatchesLoading] = useState(true)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY   = useTransform(scrollYProgress, [0,1], [0, 200])
  const heroOp  = useTransform(scrollYProgress, [0,0.8], [1, 0])

  useEffect(() => {
    dispatch(clearMovies())
    dispatch(fetchMovies({ limit:50 }))
    api.get('/matches?status=upcoming&limit=4')
      .then(res => setMatches(res.data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setMatchesLoading(false))
  }, [dispatch])

  const nowShowing = movies.filter(m => isNowShowing(m.status))
  const upcoming   = movies.filter(m => isUpcoming(m.status))

  return (
    <div style={{ background:'#020108' }}>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Orb x={15} y={20} size="600px" color="rgba(102,51,212,0.5)"  delay={0} />
          <Orb x={75} y={10} size="500px" color="rgba(255,45,107,0.35)" delay={3} />
          <Orb x={50} y={70} size="700px" color="rgba(184,255,0,0.15)"  delay={6} />
          <Orb x={85} y={60} size="400px" color="rgba(102,51,212,0.3)"  delay={2} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Scanline sweep */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent pointer-events-none"
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration:4, repeat:Infinity, ease:'linear', repeatDelay:3 }}
        />

        {/* Parallax content */}
        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 max-w-6xl mx-auto px-4 text-center pt-16">

          {/* Badge */}
          <motion.div initial={{ opacity:0, y:20, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.2, type:'spring' }}
            className="inline-flex items-center gap-3 glass px-5 py-2.5 rounded-full mb-10 neon-border-volt">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <span className="label text-violet-300">NEXT-GEN CINEMA BOOKING</span>
          </motion.div>

          {/* Main heading — staggered letter reveal */}
          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y:120 }} animate={{ y:0 }} transition={{ delay:0.3, duration:0.8, ease:[0.16, 1, 0.3, 1] }}
              className="heading-xl text-white leading-none">
              BOOK THE
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1 initial={{ y:120 }} animate={{ y:0 }} transition={{ delay:0.45, duration:0.8, ease:[0.16, 1, 0.3, 1] }}
              className="heading-xl text-multi leading-none">
              EXPERIENCE
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7, duration:0.6 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Cinema reimagined. Real-time seats, instant booking, and immersive discovery — all in one futuristic platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.85, duration:0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link to="/movies" className="btn-volt text-base px-10 py-4 rounded-xl">
              🎬 Explore Movies
            </Link>
            <Link to="/matches" className="btn-outline text-base px-10 py-4 rounded-xl">
              🏏 Book Matches
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl glass">
            {[
              { val:'50+',  label:'Movies',       icon:'🎬' },
              { val:'200+', label:'Shows Daily',  icon:'⚡' },
              { val:'15',   label:'Theatres',     icon:'🏛' },
              { val:'4.9★', label:'Rating',       icon:'✨' },
            ].map(({ val, label, icon }, i) => (
              <motion.div key={label}
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay: 1.2 + i*0.1, type:'spring' }}
                whileHover={{ background:'rgba(102,51,212,0.12)' }}
                className="text-center py-6 px-4 transition-all duration-300">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="font-display text-2xl font-bold text-volt">
                  <Counter value={val} />
                </p>
                <p className="text-xs text-white/35 mt-1 label">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="label text-white/25">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-violet-500/60 to-transparent" />
        </motion.div>
      </section>

      {/* ═══ FEATURES STRIP ═══ */}
      <motion.section initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        className="relative py-8 overflow-hidden border-y border-white/[0.04]"
        style={{ background:'rgba(102,51,212,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon:'⚡', title:'Real-Time Booking',  desc:'Live seat availability' },
              { icon:'🔒', title:'Seat Lock System',   desc:'Reserve for 10 minutes' },
              { icon:'🎟️', title:'QR Tickets',          desc:'Instant digital tickets' },
              { icon:'💳', title:'Secure Payment',     desc:'Multiple payment modes' },
            ].map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }}
                whileHover={{ scale:1.04 }}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-white/[0.04]">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/35">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ NOW SHOWING ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader dot="●" dotColor="text-cyan-400" label="NOW SHOWING" title="In Theatres" linkTo="/movies?status=now_showing" />
          <MovieGrid movies={nowShowing.slice(0,8)} loading={loading} emptyMsg="No movies currently showing." />
          {nowShowing.length > 0 && (
            <div className="text-center mt-8 sm:hidden">
              <Link to="/movies?status=now_showing" className="nova-btn-outline text-xs py-2 px-6">View All →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══ MATCHES ═══ */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background:'rgba(0,0,0,0.3)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', right:'-10%', top:'20%', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(74,222,128,0.06)', filter:'blur(80px)' }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <SectionHeader dot="🏏" dotColor="text-green-400" label="CRICKET & SPORTS" title="Upcoming Matches" linkTo="/matches" />
          <MatchGrid matches={matches} loading={matchesLoading} />
        </div>
      </section>

      {/* ═══ COMING SOON ═══ */}
      {(loading || upcoming.length > 0) && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <SectionHeader dot="◆" dotColor="text-yellow-400" label="COMING SOON" title="Upcoming Releases" linkTo="/movies?status=upcoming" />
            <MovieGrid movies={upcoming.slice(0,4)} loading={loading} skeletonCount={4} emptyMsg="No upcoming movies yet." />
          </div>
        </section>
      )}

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Orb x={20} y={50} size="400px" color="rgba(102,51,212,0.3)" delay={0} />
          <Orb x={80} y={50} size="400px" color="rgba(255,45,107,0.2)" delay={4} />
        </div>
        <div className="absolute inset-0 grid-bg opacity-20" />

        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}
          className="relative z-10 max-w-3xl mx-auto text-center">

          <motion.div initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }}
            transition={{ type:'spring', stiffness:200, delay:0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-volt mb-6 text-3xl">
            🎬
          </motion.div>

          <h2 className="heading-lg text-white mb-4">
            Ready to Experience <span className="text-multi">Cinema?</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">Join thousands of movie enthusiasts who book with NovaCinema</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-volt text-base px-10 py-4 rounded-xl">
              Create Free Account
            </Link>
            <Link to="/movies" className="btn-outline text-base px-10 py-4 rounded-xl">
              Browse Movies
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}