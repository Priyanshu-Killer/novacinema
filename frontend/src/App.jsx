import React, { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe } from './store/slices/authSlice'
import { connectSocket } from './services/socket'

// ── Custom Cursor ──

// Pages
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import BookingPage from './pages/BookingPage'
import ProfilePage from './pages/user/ProfilePage'
import BookingHistoryPage from './pages/user/BookingHistoryPage'
import BookingConfirmationPage from './pages/user/BookingConfirmationPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MatchesPage from './pages/MatchesPage'
import MatchDetailPage from './pages/MatchDetailPage'
import MatchBookingConfirmPage from './pages/MatchBookingConfirmPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminTheatres from './pages/admin/AdminTheatres'
import AdminShows from './pages/admin/AdminShows'
import AdminBookings from './pages/admin/AdminBookings'
import AdminUsers from './pages/admin/AdminUsers'
import AdminMatches from './pages/admin/AdminMatches'

// Layout
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'

// ── Global cursor effect ──

// ── Global cursor effect ──

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Only fetch once on mount — not on every auth state change
    const token = localStorage.getItem('novacinema_token')
    if (token) dispatch(fetchMe())
    connectSocket()
  }, [])

  return (
    <Router>
      {/* Global cursor */}
      <div id="nova-cursor" />
      <div id="nova-cursor-ring" />
      <CursorEffect />
<Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1d1530', color: '#fff', border: '1px solid rgba(91,68,160,0.4)' },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#040308' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />
      <Routes>
        <Route path="/*" element={<PublicLayout />} />
        <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />
      </Routes>
    </Router>
  )
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-nova-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/match-booking/:id" element={<ProtectedRoute><MatchBookingConfirmPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/booking/:movieId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><BookingHistoryPage /></ProtectedRoute>} />
          <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-nova-950">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/movies" element={<AdminMovies />} />
        <Route path="/theatres" element={<AdminTheatres />} />
        <Route path="/shows" element={<AdminShows />} />
        <Route path="/bookings" element={<AdminBookings />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/matches" element={<AdminMatches />} />
      </Routes>
    </div>
  )
}

// ── Custom Cursor (works on all pages including admin) ──
function CursorEffect() {
  useEffect(() => {
    const cursor = document.getElementById('nova-cursor')
    const ring   = document.getElementById('nova-cursor-ring')
    if (!cursor || !ring) return
    let mx = 0, my = 0, rx = 0, ry = 0
    const onMove = (e) => { mx = e.clientX; my = e.clientY }
    document.addEventListener('mousemove', onMove)
    let raf
    const animate = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      cursor.style.left = mx + 'px'
      cursor.style.top  = my + 'px'
      ring.style.left   = rx + 'px'
      ring.style.top    = ry + 'px'
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    const onEnter = () => { cursor.classList.add('hovering');    ring.classList.add('hovering') }
    const onLeave = () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering') }
    const addListeners = () => {
      document.querySelectorAll('a,button,[role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    addListeners()
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList:true, subtree:true })
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); observer.disconnect() }
  }, [])
  return null
}

export default App