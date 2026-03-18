const Show = require('../models/Show');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join show room for real-time seat updates
    socket.on('joinShow', (showId) => {
      socket.join(`show:${showId}`);
      console.log(`Socket ${socket.id} joined show room: ${showId}`);
    });

    socket.on('leaveShow', (showId) => {
      socket.leave(`show:${showId}`);
    });

    // Seat selection preview (not booking)
    socket.on('seatHover', ({ showId, row, seatNumber, userId }) => {
      socket.to(`show:${showId}`).emit('seatHovered', { row, seatNumber, userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Periodic cleanup of expired seat locks (every 5 minutes)
  setInterval(async () => {
    try {
      const shows = await Show.find({ status: { $in: ['scheduled', 'ongoing'] } });
      for (const show of shows) {
        const hadExpiredLocks = show.releaseExpiredLocks();
        if (hadExpiredLocks) {
          await show.save();
          io.to(`show:${show._id}`).emit('seatsReleased', { showId: show._id });
          console.log(`🔓 Released expired seat locks for show: ${show._id}`);
        }
      }
    } catch (err) {
      console.error('Seat lock cleanup error:', err.message);
    }
  }, 5 * 60 * 1000);
};

module.exports = { initializeSocket };
