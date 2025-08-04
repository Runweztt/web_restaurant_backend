// backend/models/tables.js
const mongoose = require('mongoose');

/**
 * Table definitions imported from CSV.
 * Availability is resolved at booking time by checking bookings.
 */
const tableSchema = new mongoose.Schema({
  table_id: { type: String, required: true }, // matches CSV column
  type: { type: String },
  capacity: { type: Number, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Unique table definition per table_id
tableSchema.index({ table_id: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
