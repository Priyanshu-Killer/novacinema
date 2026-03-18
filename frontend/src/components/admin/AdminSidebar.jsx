import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin',           label: 'Dashboard', icon: '⚡' },
  { to: '/admin/movies',    label: 'Movies',    icon: '🎬' },
  { to: '/admin/matches',   label: 'Matches',   icon: '🏏' },
  { to: '/admin/theatres',  label: 'Theatres',  icon: '🏛️' },
  { to: '/admin/shows',     label: 'Shows',     icon: '📅' },
  { to: '/admin/bookings',  label: 'Bookings',  icon: '🎟️' },
  { to: '/admin/users',     label: 'Users',     icon: '👥' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-nova-900/80 border-r border-nova-700/30 flex flex-col">
      <div className="p-6 border-b border-nova-700/30">
        <Link to="/" className="font-display font-black text-lg text-white">NOVA<span className="text-gradient">CINEMA</span></Link>
        <p className="text-xs text-nova-500 mt-1">Admin Console</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              location.pathname === item.to
                ? 'bg-nova-500/30 text-white border border-nova-500/30'
                : 'text-nova-400 hover:text-white hover:bg-nova-800/50'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-nova-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-nova-500 flex items-center justify-center text-sm font-bold">{user?.name?.[0]}</div>
          <div>
            <p className="text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-nova-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-left text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10">
          ← Logout
        </button>
      </div>
    </aside>
  )
}