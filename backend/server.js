const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes    = require('./routes/authRoutes');
const movieRoutes   = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes    = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const matchRoutes   = require('./routes/matchRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initializeSocket } = require('./sockets/socketHandler');

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Socket.IO
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.set('io', io);
initializeSocket(io);

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/movies',   movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows',    showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/matches',  matchRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'NovaCinema API Running' }));

app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novacinema')
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 NovaCinema Server running on port ${PORT}`);
      console.log(`📱 Mobile access: http://192.168.1.36:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = { app, io };