import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try { const res = await api.get('/admin/users'); setUsers(res.data.users || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`)
      toast.success('User status updated')
      fetchUsers()
    } catch { toast.error('Failed to update user') }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-white">Users</h1>
            <p className="text-nova-400 text-sm mt-1">{users.length} registered users</p>
          </div>
          {loading ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
          : (
            <div className="space-y-3">
              {users.map((user, i) => (
                <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass-dark rounded-2xl border border-nova-700/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-nova-600 flex items-center justify-center font-bold text-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-nova-400 text-xs">{user.email}</p>
                      {user.phone && <p className="text-nova-500 text-xs font-mono">{user.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-nova-500">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${user.isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => toggleStatus(user._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${user.isActive ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10'}`}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </motion.div>
              ))}
              {users.length === 0 && <div className="text-center py-12 text-nova-500">No users found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
