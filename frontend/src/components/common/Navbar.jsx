import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const NovaLogo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <motion.div className="relative" whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration:0.5 }}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center glow-volt">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
        </svg>
      </div>
      <motion.div className="absolute -inset-1 rounded-xl bg-violet-500/20 blur" animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:2.5, repeat:Infinity }} />
    </motion.div>
    <span className="font-display font-bold text-xl tracking-wider text-white">
      NOVA<span className="text-volt">CINEMA</span>
    </span>
  </Link>
)

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('[data-profile-menu]')) setProfileOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/')
    setProfileOpen(false)
  }

  const navLinks = [
    { to:'/',        label:'Home',    icon:'🏠' },
    { to:'/movies',  label:'Movies',  icon:'🎬' },
    { to:'/matches', label:'Matches', icon:'🏏' },
  ]
  const isAdmin = user?.role === 'admin'
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      {/* Custom cursor */}
      <div id="nova-cursor" />
      <div id="nova-cursor-ring" />

      <motion.nav
        initial={{ y:-80, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#020108]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NovaLogo />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors group">
                  <span className={isActive(link.to) ? 'text-white' : 'text-white/50 group-hover:text-white transition-colors'}>
                    {link.label}
                  </span>
                  {/* Active underline */}
                  {isActive(link.to) && (
                    <motion.div layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type:'spring', stiffness:400, damping:30 }} />
                  )}
                  {/* Hover dot */}
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}

              {isAdmin && (
                <Link to="/admin"
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    location.pathname.startsWith('/admin') ? 'text-cyan-300' : 'text-cyan-400/70 hover:text-cyan-300'
                  }`}>
                  <motion.span animate={{ scale:[1,1.3,1] }} transition={{ duration:2, repeat:Infinity }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" data-profile-menu>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border border-white/[0.08] hover:border-violet-500/30 transition-all">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black' : 'bg-gradient-to-br from-violet-500 to-violet-700 text-white'}`}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">{user?.name?.split(' ')[0]}</span>
                    {isAdmin && <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">ADMIN</span>}
                    <motion.svg animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration:0.2 }}
                      className="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                        transition={{ type:'spring', stiffness:400, damping:30 }}
                        className="absolute right-0 mt-2 w-56 glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
                        {/* Gradient top */}
                        <div className="h-px bg-gradient-to-r from-violet-500/50 via-pink-500/50 to-violet-500/50" />
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-500/10 border-b border-white/[0.05] font-medium transition-colors">
                            <span>⚡</span> Admin Dashboard
                          </Link>
                        )}
                        {[
                          { to:'/profile',     icon:'👤', label:'Profile' },
                          { to:'/my-bookings', icon:'🎟️', label:'My Bookings' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
                            <span>{item.icon}</span> {item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/[0.05]">
                          <span>→</span> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="nova-btn-outline text-xs py-2 px-4">Login</Link>
                  <Link to="/register" className="nova-btn-primary text-xs py-2 px-4">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <motion.button whileTap={{ scale:0.9 }} onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white">
              <div className="w-5 space-y-1.5">
                <motion.div animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }} className="h-0.5 bg-current rounded-full" />
                <motion.div animate={{ opacity: mobileOpen ? 0 : 1, x: mobileOpen ? -10 : 0 }} className="h-0.5 bg-current rounded-full" />
                <motion.div animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }} className="h-0.5 bg-current rounded-full" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
              className="md:hidden overflow-hidden glass-dark border-t border-white/[0.06]">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}>
                    <Link to={link.to}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.to) ? 'bg-white/[0.06] text-white border border-white/[0.08]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      }`}>
                      <span>{link.icon}</span> {link.label}
                    </Link>
                  </motion.div>
                ))}
                {isAuthenticated ? (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="pt-3 border-t border-white/[0.05] space-y-1">
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-cyan-400 hover:bg-cyan-500/10 transition-all">
                        ⚡ Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">👤 Profile</Link>
                    <Link to="/my-bookings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">🎟️ My Bookings</Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">→ Logout</button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="flex gap-2 pt-3 border-t border-white/[0.05]">
                    <Link to="/login" className="nova-btn-outline text-xs py-2 px-4 flex-1 text-center">Login</Link>
                    <Link to="/register" className="nova-btn-primary text-xs py-2 px-4 flex-1 text-center">Sign Up</Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Cursor script */}
      <CursorEffect />
    </>
  )
}

function CursorEffect() {
  useEffect(() => {
    const cursor = document.getElementById('nova-cursor')
    const ring   = document.getElementById('nova-cursor-ring')
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMove)

    const animate = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      cursor.style.left = mx + 'px'
      cursor.style.top  = my + 'px'
      ring.style.left   = rx + 'px'
      ring.style.top    = ry + 'px'
      requestAnimationFrame(animate)
    }
    const raf = requestAnimationFrame(animate)

    const onEnter = () => { cursor.classList.add('hovering'); ring.classList.add('hovering') }
    const onLeave = () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering') }

    const addHover = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    addHover()

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])
  return null
}