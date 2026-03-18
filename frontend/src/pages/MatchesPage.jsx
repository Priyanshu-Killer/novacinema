import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import MatchCard from '../components/common/MatchCard'

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { limit: 100 }
        if (status) params.status = status
        const res = await api.get('/matches', { params })
        setMatches(res.data.matches || [])
      } catch { setMatches([]) }
      finally { setLoading(false) }
    }
    load()
  }, [status])

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-4 border border-white/10">
            <span className="text-lg">🏏</span>
            <span className="text-xs font-mono text-white/60 tracking-widest">SPORTS TICKETS</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="section-heading mb-1">Live & Upcoming Matches</motion.h1>
          <p className="text-nova-400 text-sm">{matches.length} matches available</p>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { value: '',          label: 'All Matches' },
            { value: 'upcoming',  label: '● Upcoming' },
            { value: 'live',      label: '● Live' },
            { value: 'completed', label: 'Completed' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setStatus(opt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                status === opt.value
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500'
                  : 'border-white/10 text-white/40 hover:border-white/30'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ height: '280px' }} />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-5xl mb-4">🏏</div>
            <p className="text-white/50">No matches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {matches.map((match, i) => (
              <motion.div key={match._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <MatchCard match={match} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}