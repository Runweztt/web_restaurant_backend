// backend/models/Booking.js
const mongoose = require('mongoose');

/**
 * Booking ties a table to a specific timeSlot.
 * Ensures no double-booking via unique index on (table_id, timeSlot).
 */
const bookingSchema = new mongoose.Schema({
  table_id: { type: String, required: true },
  timeSlot: { type: String, required: true }, // e.g., ISO datetime string
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ table_id: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
