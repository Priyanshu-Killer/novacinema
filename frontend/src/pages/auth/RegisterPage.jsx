import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const { loading, error, isAuthenticated } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { if (isAuthenticated) navigate('/') }, [isAuthenticated])
  useEffect(() => { dispatch(clearError()) }, [])
  useEffect(() => { if (error) toast.error(error) }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    dispatch(registerUser(form))
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 bg-nova-gradient">
      <div className="absolute inset-0 spotlight" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md glass-dark rounded-2xl p-8 border border-nova-600/30">

        <div className="text-center mb-8">
          <Link to="/" className="font-display font-black text-2xl text-white">NOVA<span className="text-gradient">CINEMA</span></Link>
          <h2 className="font-display text-xl font-bold text-white mt-4">Create Account</h2>
          <p className="text-nova-400 text-sm mt-1">Join the future of movie booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
            { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' }
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-nova-400 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                required={field.key !== 'phone'}
                value={form[field.key]}
                onChange={e => setForm({...form, [field.key]: e.target.value})}
                className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-4 py-3 text-white placeholder-nova-600 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="nova-btn-cyan w-full py-3 mt-2 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-nova-400 mt-6">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}
