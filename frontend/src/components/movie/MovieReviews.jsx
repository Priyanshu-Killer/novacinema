import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ── Star Rating Input ──
function StarInput({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          style={{ fontSize: size, background:'none', border:'none', cursor:'pointer', transition:'transform 0.15s', transform: (hover||value) >= star ? 'scale(1.2)' : 'scale(1)' }}>
          <span style={{ color: (hover||value) >= star ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
        </button>
      ))}
    </div>
  )
}

// ── Star Display ──
function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <span key={star} style={{ fontSize:size, color: rating >= star ? '#fbbf24' : rating >= star - 0.5 ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  )
}

// ── Rating Bar ──
function RatingBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span style={{ color:'rgba(255,255,255,0.5)', width:'12px', textAlign:'right' }}>{label}</span>
      <span style={{ color:'#fbbf24', fontSize:'11px' }}>★</span>
      <div style={{ flex:1, height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:'easeOut' }}
          style={{ height:'100%', borderRadius:'3px', background: color }} />
      </div>
      <span style={{ color:'rgba(255,255,255,0.3)', width:'20px' }}>{count}</span>
    </div>
  )
}

export default function MovieReviews({ movieId }) {
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const [reviews, setReviews]         = useState([])
  const [total, setTotal]             = useState(0)
  const [avgRating, setAvgRating]     = useState(0)
  const [distribution, setDistribution] = useState({ 1:0,2:0,3:0,4:0,5:0 })
  const [myReview, setMyReview]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState({ rating:0, title:'', body:'' })
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(false)

  useEffect(() => { loadReviews(1); if (isAuthenticated) loadMyReview() }, [movieId])

  const loadReviews = async (p = 1) => {
    try {
      setLoading(p === 1)
      const res = await api.get(`/reviews/${movieId}?page=${p}&limit=5`)
      const d   = res.data
      setReviews(prev => p === 1 ? d.reviews : [...prev, ...d.reviews])
      setTotal(d.total)
      setAvgRating(d.avgRating)
      setDistribution(d.distribution)
      setHasMore(p * 5 < d.total)
      setPage(p)
    } catch { } finally { setLoading(false) }
  }

  const loadMyReview = async () => {
    try {
      const res = await api.get(`/reviews/${movieId}/my`)
      if (res.data.review) {
        setMyReview(res.data.review)
        setForm({ rating: res.data.review.rating, title: res.data.review.title, body: res.data.review.body })
      }
    } catch {}
  }

  const handleSubmit = async () => {
    if (!form.rating) return toast.error('Please select a rating')
    try {
      setSubmitting(true)
      await api.post('/reviews', { movieId, ...form })
      toast.success(myReview ? 'Review updated! ⭐' : 'Review posted! ⭐')
      setShowForm(false)
      loadReviews(1)
      loadMyReview()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  const handleLike = async (reviewId) => {
    if (!isAuthenticated) return toast.error('Login to like reviews')
    try {
      const res = await api.post(`/reviews/${reviewId}/like`)
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, likes: res.data.likes } : r))
    } catch {}
  }

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`)
      toast.success('Review deleted')
      setMyReview(null)
      setForm({ rating:0, title:'', body:'' })
      loadReviews(1)
    } catch {}
  }

  const barColors = { 5:'#4ade80', 4:'#a3e635', 3:'#fbbf24', 2:'#f97316', 1:'#ef4444' }

  return (
    <section>
      <h2 className="text-white font-bold text-lg mb-6">Reviews & Ratings</h2>

      {/* ── Rating Summary ── */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Big number */}
          <div className="text-center flex-shrink-0">
            <motion.p initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}
              style={{ fontFamily:'Bebas Neue,cursive', fontSize:'4rem', lineHeight:1, color:'#fbbf24' }}>
              {avgRating || '—'}
            </motion.p>
            <StarDisplay rating={avgRating} size={16} />
            <p className="text-white/30 text-xs mt-1">{total} review{total !== 1 ? 's' : ''}</p>
          </div>

          {/* Bars */}
          <div className="flex-1 space-y-2">
            {[5,4,3,2,1].map(star => (
              <RatingBar key={star} label={star} count={distribution[star]||0} total={total} color={barColors[star]} />
            ))}
          </div>

          {/* Write review button */}
          <div className="flex-shrink-0 flex items-center">
            {isAuthenticated ? (
              <button onClick={() => setShowForm(!showForm)}
                className="nova-btn-cyan text-sm">
                {myReview ? '✏️ Edit Review' : '⭐ Write Review'}
              </button>
            ) : (
              <Link to="/login" className="nova-btn-outline text-sm">Login to Review</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Write Review Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="glass rounded-2xl p-6 mb-6 border border-violet-500/20">
            <h3 className="text-white font-semibold mb-4">{myReview ? 'Update Your Review' : 'Write a Review'}</h3>

            <div className="mb-4">
              <p className="text-white/40 text-xs mb-2">Your Rating *</p>
              <StarInput value={form.rating} onChange={r => setForm(f => ({...f, rating:r}))} size={32} />
            </div>

            <div className="mb-3">
              <input className="input-field" placeholder="Review title (optional)"
                value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} />
            </div>

            <div className="mb-4">
              <textarea className="input-field resize-none h-24" placeholder="Share your thoughts about this movie..."
                value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="nova-btn-outline text-sm">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="nova-btn-cyan text-sm">
                {submitting ? 'Posting...' : myReview ? 'Update Review' : 'Post Review'}
              </button>
              {myReview && (
                <button onClick={() => handleDelete(myReview._id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">
                  Delete Review
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── My Review Preview ── */}
      {myReview && !showForm && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="glass rounded-2xl p-4 mb-4 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-white text-sm font-medium">You</span>
              <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">Your Review</span>
            </div>
            <StarDisplay rating={myReview.rating} />
          </div>
          {myReview.title && <p className="text-white/80 text-sm font-medium mb-1">{myReview.title}</p>}
          {myReview.body  && <p className="text-white/50 text-sm">{myReview.body}</p>}
        </motion.div>
      )}

      {/* ── Reviews List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 glass rounded-2xl">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-white/40 text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.filter(r => r.user?._id !== user?._id).map((review, i) => (
            <motion.div key={review._id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nova-500 to-nova-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-white/30 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
              {review.title && <p className="text-white/80 text-sm font-semibold mb-1">{review.title}</p>}
              {review.body  && <p className="text-white/50 text-sm leading-relaxed">{review.body}</p>}
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => handleLike(review._id)}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                  👍 <span>{review.likes || 0}</span>
                </button>
              </div>
            </motion.div>
          ))}

          {hasMore && (
            <button onClick={() => loadReviews(page + 1)}
              className="w-full py-3 text-sm text-white/40 hover:text-white/60 transition-colors glass rounded-2xl">
              Load more reviews
            </button>
          )}
        </div>
      )}
    </section>
  )
}