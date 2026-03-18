const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Mock payment processing simulation
exports.processPayment = asyncHandler(async (req, res) => {
  const { amount, method, cardDetails, upiId } = req.body;

  // Simulate payment processing (2 second delay)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;

  if (!isSuccess) {
    return res.status(402).json({ success: false, message: 'Payment failed. Please try again.' });
  }

  res.json({
    success: true,
    message: 'Payment processed successfully',
    transactionData: {
      transactionId: `MOCK-${Date.now()}`,
      method,
      amount,
      processedAt: new Date()
    }
  });
});

exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('booking')
    .sort({ createdAt: -1 });
  res.json({ success: true, payments });
});
