// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookingRoute');

const app = express();
const server = http.createServer(app);

// CORS: restrict to your Vercel frontend domain
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Mount API routes
app.use('/admin', adminRoutes);
app.use('/booking', bookingRoutes);

// Socket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// MongoDB connection
const dbUri = process.env.MONGO_URI || process.env.MONGODB_URL;
if (!dbUri) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}
mongoose
  .connect(dbUri)
  .then(() => console.log(' Connected to MongoDB'))
  .catch((err) => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Backend listening on port ${PORT}`);
});
