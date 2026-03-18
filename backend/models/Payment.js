const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, default: () => `TXN-${uuidv4().slice(0, 12).toUpperCase()}` },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  refundId: { type: String },
  refundedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
