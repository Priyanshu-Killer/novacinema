import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'' })
  const [showPw, setShowPw]   = useState(false)
  const [focused, setFocused] = useState('')
  const [strength, setStrength] = useState(0)
  const { loading, error, isAuthenticated } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => { if (isAuthenticated) navigate('/', { replace:true }) }, [isAuthenticated])
  useEffect(() => { if (error) toast.error(error) }, [error])

  useEffect(() => {
    const p = form.password
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    setStrength(s)
  }, [form.password])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim())          return toast.error('Name is required')
    if (!form.email.trim())         return toast.error('Email is required')
    if (form.password.length < 6)   return toast.error('Password must be at least 6 characters')
    dispatch(registerUser(form))
  }

  const strengthColor = ['', '#ef4444','#f97316','#fbbf24','#84cc16','#22c55e'][strength] || '#ef4444'
  const strengthLabel = ['','Weak','Fair','Good','Strong','Very Strong'][strength] || ''

  const fields = [
    { key:'name',     label:'Full Name',    type:'text',     placeholder:'John Doe',         icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key:'email',    label:'Email',        type:'email',    placeholder:'you@example.com',  icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key:'phone',    label:'Phone (optional)', type:'tel',  placeholder:'+91 98765 43210',  icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background:'#020108' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,#0d0520 0%,#1a0a3d 50%,#030206 100%)' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <motion.div animate={{ x:[0,25,-15,0], y:[0,-15,20,0] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'15%', right:'20%', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(184,255,0,0.08)', filter:'blur(80px)', pointerEvents:'none' }} />
        <motion.div animate={{ x:[0,-20,25,0], y:[0,25,-10,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut', delay:2 }}
          style={{ position:'absolute', bottom:'15%', left:'20%', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(102,51,212,0.2)', filter:'blur(80px)', pointerEvents:'none' }} />

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
              JOIN THE<br/><span className="text-multi">EXPERIENCE</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10">
              Create your account and start booking<br/>movies and matches instantly.
            </p>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="grid grid-cols-2 gap-3">
            {[
              { icon:'🎬', title:'Movies', desc:'Browse & book' },
              { icon:'🏏', title:'Matches', desc:'Stadium seats' },
              { icon:'⭐', title:'Reviews', desc:'Rate & review' },
              { icon:'🎟', title:'Tickets', desc:'Digital QR' },
            ].map((f,i) => (
              <motion.div key={f.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7+i*0.1 }}
                className="glass rounded-xl p-3 text-left border border-white/[0.06]">
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-white text-xs font-semibold">{f.title}</div>
                <div className="text-white/30 text-xs">{f.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020108] to-transparent" />
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto">
        <div className="absolute inset-0 lg:hidden" style={{ background:'linear-gradient(135deg,#0d0520,#020108)' }} />

        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
          className="relative z-10 w-full max-w-md py-8">

          <div className="lg:hidden text-center mb-8">
            <Link to="/" style={{ fontFamily:'Bebas Neue,cursive', fontSize:'1.8rem', color:'#fff', letterSpacing:'0.1em' }}>
              NOVA<span className="text-volt">CINEMA</span>
            </Link>
          </div>

          <div className="glass-dark rounded-3xl p-8 border border-white/[0.07]" style={{ boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>

            <div className="mb-7">
              <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
              <p className="text-white/40 text-sm">Join NovaCinema — it's free</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="text-xs text-white/40 mb-1.5 block font-medium">{field.label}</label>
                  <div style={{ position:'relative' }}>
                    <input
                      type={field.type} value={form[field.key]} placeholder={field.placeholder}
                      onChange={e => setForm(f => ({...f, [field.key]:e.target.value}))}
                      onFocus={() => setFocused(field.key)} onBlur={() => setFocused('')}
                      style={{
                        width:'100%', padding:'12px 16px 12px 42px', borderRadius:'12px',
                        background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:'0.9rem',
                        border:`1px solid ${focused===field.key ? 'rgba(102,51,212,0.6)' : 'rgba(255,255,255,0.07)'}`,
                        outline:'none', transition:'all 0.2s', boxSizing:'border-box',
                        boxShadow: focused===field.key ? '0 0 0 3px rgba(102,51,212,0.1)' : 'none',
                      }} />
                    <svg style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', width:'16px', height:'16px', color: focused===field.key ? '#8855f0' : 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon}/>
                    </svg>
                  </div>
                </div>
              ))}

              {/* Password */}
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Password</label>
                <div style={{ position:'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={form.password} placeholder="Min. 6 characters"
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

                {/* Password strength */}
                {form.password && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize:'0.65rem', color:strengthColor, fontFamily:'JetBrains Mono,monospace' }}>{strengthLabel}</p>
                  </motion.div>
                )}
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
                style={{
                  width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#6633d4,#8855f0)',
                  color:'#fff', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(102,51,212,0.4)',
                  transition:'all 0.2s', marginTop:'4px',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </motion.button>
            </form>

            <p className="text-center text-sm text-white/30 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}