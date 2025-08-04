// backend/routes/bookingRoute.js
const express = require('express');
const Booking = require('../models/Booking');
const { getAvailableTables } = require('../controllers/tableController');
const sendBookingEmails = require('../utils/emailSender');

const router = express.Router();

// Helper sanitize
function safeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * GET /booking/available?timeSlot=...
 */
router.get('/available', async (req, res) => {
  try {
    const { timeSlot } = req.query;
    if (!timeSlot) return res.status(400).json({ error: 'timeSlot query param required' });

    const available = await getAvailableTables(timeSlot);
    return res.json({ success: true, available });
  } catch (err) {
    console.error('GET /booking/available error:', err);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

/**
 * Friendly GET /booking/book
 */
router.get('/book', (req, res) => {
  res.status(200).json({
    message:
      'Booking endpoint expects a POST with JSON body: { table_id, timeSlot, userEmail, userName }',
  });
});

/**
 * POST /booking/book
 */
router.post('/book', async (req, res) => {
  try {
    console.log('Incoming booking request body:', req.body);

    // Extract and sanitize
    const table_id = safeString(req.body.table_id);
    const timeSlot = safeString(req.body.timeSlot);
    const userEmail = safeString(req.body.userEmail);
    const userName = safeString(req.body.userName);

    // Validate
    if (!table_id || !timeSlot || !userEmail || !userName) {
      const missing = [];
      if (!table_id) missing.push('table_id');
      if (!timeSlot) missing.push('timeSlot');
      if (!userEmail) missing.push('userEmail');
      if (!userName) missing.push('userName');
      return res.status(400).json({
        error: `Missing required booking fields: ${missing.join(', ')}`,
      });
    }

    // Prevent double-booking
    const existing = await Booking.findOne({
      table_id,
      timeSlot,
      status: 'confirmed',
    });
    if (existing) {
      return res.status(409).json({ error: 'Table already booked for that time slot' });
    }

    // Create booking
    const booking = await Booking.create({
      table_id,
      timeSlot,
      userEmail,
      userName,
      status: 'confirmed',
    });

    // Emit realtime event
    const io = req.app.get('io');
    if (io) {
      io.emit('booking:created', { booking: booking.toObject() });
    }

    // Send emails with status tracking
    let emailStatus = { user: 'pending', admin: 'pending' };
    try {
      await sendBookingEmails({ booking });
      emailStatus = { user: 'sent', admin: 'sent' };
    } catch (emailErr) {
      console.error('Email error after booking:', emailErr);
      emailStatus = { user: 'failed', admin: 'failed' };
    }

    return res.json({ success: true, booking, emailStatus });
  } catch (err) {
    console.error('POST /booking/book error:', err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: 'Conflict: table was just booked by someone else' });
    }
    return res.status(500).json({ error: 'Booking failed due to server error' });
  }
});

module.exports = router;
