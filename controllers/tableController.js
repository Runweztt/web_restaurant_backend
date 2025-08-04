// backend/controllers/tableController.js
const Table = require('../models/tables');
const Booking = require('../models/Booking');
const parseCsv = require('../utils/csvParser');

/**
 * Upsert table definitions from CSV and return all definitions.
 */
async function processCsvAndUpsert(csvText) {
  const records = parseCsv(csvText); // each record has table_id,type,capacity,location

  const upserts = records.map(async (row) => {
    const table_id = String(row.table_id || row.table_id).trim();
    const type = row.type ? String(row.type).trim() : '';
    const capacity = parseInt(row.capacity, 10) || 1;
    const location = row.location ? String(row.location).trim() : '';

    if (!table_id) return null;

    return Table.findOneAndUpdate(
      { table_id },
      { type, capacity, location },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  });

  await Promise.all(upserts);
  return Table.find({}).lean();
}

/**
 * Get available tables for a given timeSlot by excluding already booked ones.
 */
async function getAvailableTables(timeSlot) {
  const allTables = await Table.find({}).lean();
  const booked = await Booking.find({ timeSlot, status: 'confirmed' }).lean();
  const bookedSet = new Set(booked.map((b) => b.table_id));
  return allTables.filter((t) => !bookedSet.has(t.table_id));
}

module.exports = { processCsvAndUpsert, getAvailableTables };
