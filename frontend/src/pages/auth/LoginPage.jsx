import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from === '/login' ? '/' : from, { replace: true })
      }
    }
  }, [isAuthenticated, user])

  useEffect(() => { dispatch(clearError()) }, [])
  useEffect(() => { if (error) toast.error(error) }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    dispatch(loginUser(form))
  }

  // Demo login: directly dispatch with hardcoded credentials (bypasses async state issue)
  const loginAsDemo = (role) => {
    const creds =
      role === 'admin'
        ? { email: 'admin@novacinema.com', password: 'Admin@123' }
        : { email: 'user@novacinema.com',  password: 'User@123'  }

    // Update visible form fields too (so user can see what was used)
    setForm(creds)

    // Dispatch directly with the creds object — don't rely on updated state
    dispatch(loginUser(creds))
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4" style={{ background: '#040308' }}>
      {/* background glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(91,68,160,0.15) 0%, transparent 60%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl p-8 border border-white/10"
        style={{ background: 'rgba(18,13,31,0.9)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-black text-2xl text-white">
            NOVA<span className="text-gradient">CINEMA</span>
          </Link>
          <h2 className="font-display text-xl font-bold text-white mt-3">Welcome Back</h2>
          <p className="text-nova-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* ── Demo login buttons ── */}
        <div className="mb-6">
          <p className="text-xs text-nova-500 text-center mb-3 font-mono tracking-wider">
            — QUICK DEMO LOGIN —
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loginAsDemo('user')}
              disabled={loading}
              className="flex flex-col items-center gap-1 py-3 px-4 rounded-xl border transition-all disabled:opacity-40"
              style={{ borderColor: 'rgba(91,68,160,0.4)', background: 'rgba(61,45,104,0.2)' }}
            >
              <span className="text-xl">👤</span>
              <span className="text-xs font-semibold text-nova-300">Demo User</span>
              <span className="text-xs text-nova-600 font-mono">user@novacinema.com</span>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo('admin')}
              disabled={loading}
              className="flex flex-col items-center gap-1 py-3 px-4 rounded-xl border transition-all disabled:opacity-40"
              style={{ borderColor: 'rgba(34,211,238,0.4)', background: 'rgba(34,211,238,0.05)' }}
            >
              <span className="text-xl">⚡</span>
              <span className="text-xs font-semibold text-cyan-400">Demo Admin</span>
              <span className="text-xs text-nova-600 font-mono">admin@novacinema.com</span>
            </button>
          </div>
          <p className="text-xs text-nova-700 text-center mt-2">
            Click once — logs you in instantly
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-nova-800" />
          <span className="text-xs text-nova-600 font-mono">OR ENTER MANUALLY</span>
          <div className="flex-1 h-px bg-nova-800" />
        </div>

        {/* ── Manual login form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-nova-400 mb-1.5 block font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-nova-700 focus:outline-none transition-colors"
              style={{
                background: 'rgba(29,21,48,0.8)',
                border: '1px solid rgba(61,45,104,0.5)',
              }}
              onFocus={e => e.target.style.borderColor = '#22d3ee'}
              onBlur={e => e.target.style.borderColor = 'rgba(61,45,104,0.5)'}
            />
          </div>

          <div>
            <label className="text-xs text-nova-400 mb-1.5 block font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-nova-700 focus:outline-none transition-colors"
              style={{
                background: 'rgba(29,21,48,0.8)',
                border: '1px solid rgba(61,45,104,0.5)',
              }}
              onFocus={e => e.target.style.borderColor = '#22d3ee'}
              onBlur={e => e.target.style.borderColor = 'rgba(61,45,104,0.5)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 rounded-xl font-display font-semibold text-sm tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#06b6d4', color: '#040308' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-nova-950/30 border-t-nova-950 rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-nova-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}