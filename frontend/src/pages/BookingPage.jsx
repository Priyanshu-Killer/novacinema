import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovieById } from '../store/slices/movieSlice'
import { fetchShowsByMovie, fetchShowById, resetBooking, updateShowSeat } from '../store/slices/bookingSlice'
import SeatSelector from '../components/user/SeatSelector'
import BookingSummary from '../components/user/BookingSummary'
import PaymentModal from '../components/user/PaymentModal'
import { joinShow, leaveShow, onSeatUpdate, offSeatUpdate } from '../services/socket'
import toast from 'react-hot-toast'

const steps = ['Select Show', 'Choose Seats', 'Payment', 'Confirmation']

export default function BookingPage() {
  const { movieId } = useParams()
  const navigate    = useNavigate()
  const dispatch    = useDispatch()
  const { selectedMovie: movie } = useSelector(s => s.movies)
  const { shows, selectedShow, selectedSeats, step, loading } = useSelector(s => s.booking)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showPayment, setShowPayment]   = useState(false)

  useEffect(() => {
    dispatch(fetchMovieById(movieId))
    dispatch(resetBooking())
  }, [movieId])

  useEffect(() => {
    if (movieId && selectedDate) {
      dispatch(fetchShowsByMovie({ movieId, date: selectedDate }))
    }
  }, [movieId, selectedDate])

  // Real-time seat updates via socket
  useEffect(() => {
    if (selectedShow) {
      joinShow(selectedShow._id)
      onSeatUpdate((data) => { dispatch(updateShowSeat(data)) })
      return () => { leaveShow(selectedShow._id); offSeatUpdate() }
    }
  }, [selectedShow?._id])

  const handleShowSelect = (show) => {
    dispatch(fetchShowById(show._id))
  }

  const handleProceedToPayment = () => {
    if (!selectedSeats.length) { toast.error('Please select at least one seat'); return }
    // Open payment modal directly — lockSeats happens inside PaymentModal on first attempt
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    navigate('/my-bookings')
  }

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d
  })

  const showsByTheatre = shows.reduce((acc, show) => {
    const tid = show.theatre?._id || 'unknown'
    if (!acc[tid]) acc[tid] = { theatre: show.theatre, shows: [] }
    acc[tid].shows.push(show)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Movie header */}
        {movie && (
          <div className="flex gap-4 items-center py-6 mb-6 border-b border-nova-700/30">
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-nova-800 flex-shrink-0">
              <img src={movie.posterUrl || movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">{movie.title}</h1>
              <p className="text-nova-400 text-sm">{movie.genre?.join(' · ')} · {Math.floor(movie.duration/60)}h {movie.duration%60}m</p>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i < step-1 ? 'text-cyan-400' : i === step-1 ? 'text-white' : 'text-nova-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < step-1 ? 'bg-cyan-500 border-cyan-500' : i === step-1 ? 'border-white bg-nova-700' : 'border-nova-700 bg-nova-900'
                }`}>
                  {i < step-1 ? '✓' : i+1}
                </div>
                <span className="text-xs hidden sm:block font-medium">{s}</span>
              </div>
              {i < steps.length-1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step-1 ? 'bg-cyan-500/50' : 'bg-nova-700/50'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Show selection */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-semibold text-white mb-4">Select Date</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map(date => {
                  const iso = date.toISOString().split('T')[0]
                  const isToday    = iso === new Date().toISOString().split('T')[0]
                  const isSelected = iso === selectedDate
                  return (
                    <button key={iso} onClick={() => setSelectedDate(iso)}
                      className={`flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all ${
                        isSelected ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-nova-700/50 text-nova-400 hover:border-nova-500'
                      }`}>
                      <p className="text-xs">{isToday ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                      <p className="text-lg font-bold mt-1">{date.getDate()}</p>
                      <p className="text-xs">{date.toLocaleDateString('en-IN', { month: 'short' })}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <h2 className="font-display text-lg font-semibold text-white mb-4">Select Theatre & Show</h2>
            {loading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-2 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto" /></div>
            ) : Object.keys(showsByTheatre).length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-nova-400 text-lg">No shows available for this date</p>
                <p className="text-nova-600 text-sm mt-2">Try selecting a different date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.values(showsByTheatre).map(({ theatre, shows: theatreShows }) => (
                  <div key={theatre?._id} className="glass-dark rounded-2xl border border-nova-700/30 overflow-hidden">
                    <div className="p-4 border-b border-nova-700/20">
                      <h3 className="font-semibold text-white">{theatre?.name}</h3>
                      <p className="text-xs text-nova-400">{theatre?.address?.street}, {theatre?.address?.city}</p>
                    </div>
                    <div className="p-4 flex flex-wrap gap-3">
                      {theatreShows.map(show => (
                        <button key={show._id} onClick={() => handleShowSelect(show)}
                          className={`px-4 py-3 rounded-xl border text-left transition-all ${
                            selectedShow?._id === show._id
                              ? 'bg-cyan-500/20 border-cyan-500'
                              : 'border-nova-600/40 hover:border-nova-400'
                          }`}>
                          <p className="font-mono font-bold text-white text-sm">{show.showTime}</p>
                          <p className="text-xs text-nova-400 mt-1">{show.format} · {show.language}</p>
                          <p className="text-xs text-nova-500 mt-0.5">{show.availableSeats} seats left</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedShow && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-right">
                <button onClick={() => dispatch({ type: 'booking/setStep', payload: 2 })} className="nova-btn-cyan">
                  Continue to Seat Selection →
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 2: Seat selection */}
        {step === 2 && selectedShow && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-dark rounded-2xl p-6 border border-nova-700/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Select Seats</h2>
                    <p className="text-xs text-nova-400 mt-1">{selectedShow.availableSeats} seats available · Max 8 per booking</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-nova-400">{selectedShow.theatre?.name}</p>
                    <p className="text-xs text-cyan-400 font-mono">{selectedShow.showTime} · {selectedShow.format}</p>
                  </div>
                </div>
                <SeatSelector show={selectedShow} />
              </div>
            </div>
            <div>
              <BookingSummary
                show={selectedShow}
                movie={movie}
                onProceed={handleProceedToPayment}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            show={selectedShow}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}