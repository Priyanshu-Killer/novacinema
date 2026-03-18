import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { createBooking, lockSeats } from '../../store/slices/bookingSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function PaymentModal({ show, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const { selectedSeats, selectedShow } = useSelector(s => s.booking)
  const [step, setStep]           = useState('method')
  const [method, setMethod]       = useState('card')
  const [cardDetails, setCardDetails] = useState({ number: '4242 4242 4242 4242', expiry: '12/26', cvv: '123', name: 'Test User' })
  const [upiId, setUpiId]         = useState('')
  const [netBank, setNetBank]     = useState('sbi')
  const [wallet, setWallet]       = useState('paytm')
  const [seatsLocked, setSeatsLocked] = useState(false) // track if seats already locked

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0)
  const fee      = Math.round(subtotal * 0.05)
  const total    = subtotal + fee

  const paymentMethods = [
    { id: 'card',       label: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi',        label: 'UPI',               icon: '📱' },
    { id: 'netbanking', label: 'Net Banking',        icon: '🏦' },
    { id: 'wallet',     label: 'Wallet',             icon: '👛' },
  ]

  const handlePayment = async () => {
    setStep('processing')
    try {
      // Step 1: Lock seats only if not already locked
      if (!seatsLocked) {
        await dispatch(lockSeats({
          showId: selectedShow._id,
          seats: selectedSeats.map(({ row, seatNumber }) => ({ row, seatNumber }))
        })).unwrap()
        setSeatsLocked(true)
      }

      // Step 2: Process mock payment
      const paymentRes = await api.post('/payments/process', {
        amount: total, method,
        cardDetails: method === 'card' ? cardDetails : undefined
      }).catch(() => ({ data: { transactionData: { transactionId: 'TXN' + Date.now() } } }))

      // Step 3: Create booking
      await dispatch(createBooking({
        showId: selectedShow._id,
        seats: selectedSeats.map(({ row, seatNumber }) => ({ row, seatNumber })),
        paymentDetails: {
          method,
          transactionId: paymentRes.data.transactionData?.transactionId
        }
      })).unwrap()

      setStep('success')
      toast.success('Booking confirmed! 🎉')
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setStep('failed')
      toast.error(typeof err === 'string' ? err : err?.message || 'Payment failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-dark rounded-2xl w-full max-w-md overflow-hidden border border-nova-600/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nova-700/30">
          <h2 className="font-display text-lg font-bold text-white">Secure Payment</h2>
          {step === 'method' && (
            <button onClick={onClose} className="text-nova-400 hover:text-white">✕</button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Method ── */}
            {step === 'method' && (
              <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Amount */}
                <div className="glass rounded-xl p-4 mb-6 text-center">
                  <p className="text-nova-400 text-sm">Total Amount</p>
                  <p className="font-display text-3xl font-bold text-gradient-gold mt-1">₹{total}</p>
                  <p className="text-xs text-nova-500 mt-1">{selectedSeats.length} seat(s) + ₹{fee} convenience fee</p>
                </div>

                {/* Payment methods */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setMethod(pm.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        method === pm.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-nova-600/30 hover:border-nova-500/50'
                      }`}>
                      <div className="text-xl mb-1">{pm.icon}</div>
                      <div className="text-xs text-nova-300">{pm.label}</div>
                    </button>
                  ))}
                </div>

                {/* Card */}
                {method === 'card' && (
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-xs text-nova-400 mb-1 block">Card Number</label>
                      <input className="w-full bg-nova-800/50 border border-nova-600/30 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                        value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                        placeholder="4242 4242 4242 4242" />
                    </div>
                    <div>
                      <label className="text-xs text-nova-400 mb-1 block">Cardholder Name</label>
                      <input className="w-full bg-nova-800/50 border border-nova-600/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                        placeholder="Name on card" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-nova-400 mb-1 block">Expiry</label>
                        <input className="w-full bg-nova-800/50 border border-nova-600/30 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                          value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                          placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="text-xs text-nova-400 mb-1 block">CVV</label>
                        <input className="w-full bg-nova-800/50 border border-nova-600/30 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                          value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                          placeholder="123" type="password" />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI */}
                {method === 'upi' && (
                  <div className="mb-6">
                    <label className="text-xs text-nova-400 mb-1 block">UPI ID</label>
                    <input className="w-full bg-nova-800/50 border border-nova-600/30 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                      value={upiId} onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi" />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <button key={app} className="text-xs px-3 py-1.5 rounded-lg border border-nova-600/30 text-nova-400 hover:border-nova-500 hover:text-white transition-all">
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {method === 'netbanking' && (
                  <div className="mb-6">
                    <label className="text-xs text-nova-400 mb-2 block">Select Bank</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sbi',   label: 'SBI'   },
                        { id: 'hdfc',  label: 'HDFC'  },
                        { id: 'icici', label: 'ICICI' },
                        { id: 'axis',  label: 'Axis'  },
                        { id: 'kotak', label: 'Kotak' },
                        { id: 'pnb',   label: 'PNB'   },
                      ].map(bank => (
                        <button key={bank.id} onClick={() => setNetBank(bank.id)}
                          className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                            netBank === bank.id
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                              : 'border-nova-600/30 text-nova-400 hover:border-nova-500'
                          }`}>
                          {bank.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wallet */}
                {method === 'wallet' && (
                  <div className="mb-6">
                    <label className="text-xs text-nova-400 mb-2 block">Select Wallet</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'paytm',      label: 'Paytm',   icon: '💙' },
                        { id: 'phonepe',    label: 'PhonePe', icon: '💜' },
                        { id: 'amazon',     label: 'Amazon',  icon: '🟡' },
                        { id: 'mobikwik',   label: 'MobiKwik',icon: '🔵' },
                        { id: 'freecharge', label: 'Free',    icon: '🟢' },
                        { id: 'airtel',     label: 'Airtel',  icon: '🔴' },
                      ].map(w => (
                        <button key={w.id} onClick={() => setWallet(w.id)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            wallet === w.id
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-nova-600/30 hover:border-nova-500'
                          }`}>
                          <div className="text-lg">{w.icon}</div>
                          <div className={`text-xs mt-0.5 font-medium ${wallet === w.id ? 'text-cyan-400' : 'text-nova-400'}`}>{w.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-nova-500 mb-4 text-center">🔒 This is a mock payment for demo purposes</p>
                <button onClick={handlePayment} className="nova-btn-cyan w-full">
                  Pay ₹{total}
                </button>
              </motion.div>
            )}

            {/* ── Processing ── */}
            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <div className="w-16 h-16 border-4 border-nova-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-display text-lg text-white">Processing Payment</p>
                <p className="text-nova-400 text-sm mt-2">Please wait, don't close this window...</p>
              </motion.div>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto mb-4 text-4xl">✓</div>
                </motion.div>
                <p className="font-display text-xl text-white">Booking Confirmed!</p>
                <p className="text-nova-400 text-sm mt-2">Redirecting to your ticket...</p>
              </motion.div>
            )}

            {/* ── Failed ── */}
            {step === 'failed' && (
              <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto mb-4 text-4xl">✕</div>
                <p className="font-display text-xl text-white">Payment Failed</p>
                <p className="text-nova-400 text-sm mt-2 mb-6">Your seats are still reserved. Try again.</p>
                <div className="flex gap-3">
                  {/* Go back to method — seats already locked so skip lockSeats on retry */}
                  <button onClick={() => setStep('method')} className="nova-btn-cyan flex-1">Try Again</button>
                  <button onClick={onClose} className="nova-btn-outline flex-1">Cancel</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}