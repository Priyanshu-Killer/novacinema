import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../store/slices/authSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await dispatch(updateProfile(form)).unwrap()
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangingPw(true)
    try {
      await api.put('/auth/change-password', pwForm)
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setChangingPw(false) }
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="section-heading mb-8">My Profile</h1>

        {/* Avatar */}
        <div className="glass-dark rounded-2xl p-6 border border-nova-700/30 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-nova-500 flex items-center justify-center text-2xl font-bold text-white glow-nova">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-white">{user?.name}</p>
            <p className="text-nova-400 text-sm">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-nova-700/50 text-nova-400'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Profile form */}
        <div className="glass-dark rounded-2xl p-6 border border-nova-700/30 mb-6">
          <h2 className="font-display text-lg font-bold text-white mb-4">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'phone', label: 'Phone Number', type: 'tel' }
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-nova-400 mb-1 block">{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
              </div>
            ))}
            <div>
              <label className="text-xs text-nova-400 mb-1 block">Email</label>
              <input type="email" value={user?.email} disabled
                className="w-full bg-nova-800/30 border border-nova-700/20 rounded-xl px-4 py-3 text-nova-500 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={saving} className="nova-btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="glass-dark rounded-2xl p-6 border border-nova-700/30">
          <h2 className="font-display text-lg font-bold text-white mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' }
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-nova-400 mb-1 block">{f.label}</label>
                <input type="password" value={pwForm[f.key]} onChange={e => setPwForm({...pwForm, [f.key]: e.target.value})}
                  required className="w-full bg-nova-800/50 border border-nova-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
              </div>
            ))}
            <button type="submit" disabled={changingPw} className="nova-btn-outline disabled:opacity-50">
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
