import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../services/api'

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-dark rounded-2xl p-6 border border-nova-700/30">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-nova-400 text-sm">{title}</p>
        <p className={`font-display text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </motion.div>
)

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(res => { setStats(res.data.stats); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex"><AdminSidebar />
      <div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin" /></div>
    </div>
  )

  const chartData = stats?.monthlyRevenue?.map(d => ({
    name: monthNames[d._id.month - 1],
    revenue: d.revenue,
    bookings: d.count
  })) || []

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', icon: '👥', color: 'text-cyan-400', delay: 0.1 },
    { title: 'Active Movies', value: stats?.totalMovies?.toLocaleString() || '0', icon: '🎬', color: 'text-nova-300', delay: 0.2 },
    { title: 'Total Bookings', value: stats?.totalBookings?.toLocaleString() || '0', icon: '🎟️', color: 'text-gold-400', delay: 0.3 },
    {
  title: 'Total Revenue',
  value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
  icon: '💰',
  color: 'text-green-400',
  delay: 0.4
}
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-nova-400 text-sm mt-1">Welcome back, {stats ? 'here\'s your overview' : 'loading...'}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => <StatCard key={s.title} {...s} />)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-dark rounded-2xl p-6 border border-nova-700/30">
              <h3 className="font-display text-sm font-bold text-white mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f45" />
                  <XAxis dataKey="name" tick={{ fill: '#8b6fd4', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b6fd4', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1d1530', border: '1px solid #3d2d68', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#5b44a0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-dark rounded-2xl p-6 border border-nova-700/30">
              <h3 className="font-display text-sm font-bold text-white mb-4">Booking Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f45" />
                  <XAxis dataKey="name" tick={{ fill: '#8b6fd4', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b6fd4', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1d1530', border: '1px solid #3d2d68', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top movies */}
          {stats?.topMovies?.length > 0 && (
            <div className="glass-dark rounded-2xl p-6 border border-nova-700/30">
              <h3 className="font-display text-sm font-bold text-white mb-4">Top Movies by Bookings</h3>
              <div className="space-y-3">
                {stats.topMovies.map((item, i) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <span className="font-mono text-nova-500 w-4 text-sm">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{item.movie?.title}</span>
                        <span className="text-sm text-nova-400 font-mono">{item.bookings} bookings</span>
                      </div>
                      <div className="h-1.5 bg-nova-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-nova-500 to-cyan-400 rounded-full"
                          style={{ width: `${(item.bookings / stats.topMovies[0].bookings) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
