import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [focused, setFocused] = useState('')
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from || '/'

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : (from === '/login' ? '/' : from), { replace: true })
    }
  }, [isAuthenticated, user])

  useEffect(() => { dispatch(clearError()) }, [])
  useEffect(() => { if (error) toast.error(error) }, [error])

  const loginAs = (role) => {
    const creds = role === 'admin'
      ? { email: 'admin@novacinema.com', password: 'Admin@123' }
      : { email: 'user@novacinema.com',  password: 'User@123'  }
    dispatch(loginUser(creds))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    dispatch(loginUser(form))
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#020108' }}>

      {/* Left — Cinematic Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0d0520 0%, #1a0a3d 50%, #030206 100%)'
        }} />
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Orbs */}
        <motion.div animate={{ x:[0,30,-20,0], y:[0,-20,15,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'10%', left:'20%', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(102,51,212,0.2)', filter:'blur(80px)', pointerEvents:'none' }} />
        <motion.div animate={{ x:[0,-25,20,0], y:[0,20,-15,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut', delay:3 }}
          style={{ position:'absolute', bottom:'20%', right:'15%', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,45,107,0.15)', filter:'blur(80px)', pointerEvents:'none' }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <Link to="/" className="inline-flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center glow-volt">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </div>
              <span style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.8rem', color:'#fff', letterSpacing:'0.1em' }}>
                NOVA<span className="text-volt">CINEMA</span>
              </span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
            <h2 style={{ fontFamily:'Bebas Neue,cursive', fontSize:'3.5rem', color:'#fff', lineHeight:0.95, marginBottom:'16px' }}>
              YOUR SEAT<br/><span className="text-multi">AWAITS</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10">
              Book movies, matches and more.<br/>The best cinema experience starts here.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="flex flex-wrap gap-2 justify-center">
            {['🎬 Movies', '🏏 Matches', '🎟 Live Booking', '⚡ Instant Tickets'].map((f,i) => (
              <motion.span key={f} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.7+i*0.1 }}
                className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 text-white/60">
                {f}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020108] to-transparent" />
      </div>

      {/* Right — Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 lg:hidden" style={{ background:'linear-gradient(135deg,#0d0520,#020108)' }} />

        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
          className="relative z-10 w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.8rem', color:'#fff', letterSpacing:'0.1em' }}>
              NOVA<span className="text-volt">CINEMA</span>
            </Link>
          </div>

          {/* Card */}
          <div className="glass-dark rounded-3xl p-8 border border-white/[0.07]" style={{ boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-white/40 text-sm">Sign in to continue booking</p>
            </div>

            {/* Quick demo */}
            <div className="mb-6">
              <p className="label text-white/25 mb-3">Quick Demo Login</p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={() => loginAs('user')} disabled={loading}
                  style={{
                    padding:'12px', borderRadius:'14px', border:'1px solid rgba(102,51,212,0.25)',
                    background:'rgba(102,51,212,0.08)', cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(102,51,212,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(102,51,212,0.25)'}>
                  <div className="text-2xl mb-1">👤</div>
                  <div className="text-white text-xs font-semibold">Demo User</div>
                  <div className="text-white/30 text-xs mt-0.5">user@novacinema.com</div>
                </motion.button>

                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={() => loginAs('admin')} disabled={loading}
                  style={{
                    padding:'12px', borderRadius:'14px', border:'1px solid rgba(255,45,107,0.25)',
                    background:'rgba(255,45,107,0.08)', cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,45,107,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,45,107,0.25)'}>
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-cyan-400 text-xs font-semibold">Demo Admin</div>
                  <div className="text-white/30 text-xs mt-0.5">admin@novacinema.com</div>
                </motion.button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="label text-white/20">or enter manually</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Email</label>
                <div style={{ position:'relative' }}>
                  <input
                    type="email" value={form.email} placeholder="you@example.com"
                    onChange={e => setForm(f => ({...f, email:e.target.value}))}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    style={{
                      width:'100%', padding:'12px 16px 12px 42px', borderRadius:'12px',
                      background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:'0.9rem',
                      border:`1px solid ${focused==='email' ? 'rgba(102,51,212,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      outline:'none', transition:'all 0.2s', boxSizing:'border-box',
                      boxShadow: focused==='email' ? '0 0 0 3px rgba(102,51,212,0.1)' : 'none',
                    }} />
                  <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', width:'16px', height:'16px', color: focused==='email' ? '#8855f0' : 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Password</label>
                <div style={{ position:'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={form.password} placeholder="••••••••"
                    onChange={e => setForm(f => ({...f, password:e.target.value}))}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    style={{
                      width:'100%', padding:'12px 44px 12px 42px', borderRadius:'12px',
                      background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:'0.9rem',
                      border:`1px solid ${focused==='password' ? 'rgba(102,51,212,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      outline:'none', transition:'all 0.2s', boxSizing:'border-box',
                      boxShadow: focused==='password' ? '0 0 0 3px rgba(102,51,212,0.1)' : 'none',
                    }} />
                  <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', width:'16px', height:'16px', color: focused==='password' ? '#8855f0' : 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', padding:'4px' }}>
                    {showPw
                      ? <svg style={{width:'16px',height:'16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg style={{width:'16px',height:'16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
                style={{
                  width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#ff2d6b,#d91a55)',
                  color:'#fff', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(255,45,107,0.4)',
                  transition:'all 0.2s', marginTop:'4px',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>
            </form>

            <p className="text-center text-sm text-white/30 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}