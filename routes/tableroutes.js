const express = require('express');
const multer = require('multer');
const path = require('path');
const Table = require('../models/tables');
const parseCSV = require('../utils/csvParser'); // your existing parser

const router = express.Router();

// Multer setup to handle CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `tabledata-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// POST route to upload CSV and save to DB
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const tableData = await parseCSV(req.file.path);

    // Add "available: true" to each table
    const formattedData = tableData.map((row) => ({
      tableNumber: row.table_id,
      type: row.type,
      capacity: parseInt(row.capacity),
      location: row.location,
      available: true,
    }));

    // Save to MongoDB
    await Table.insertMany(formattedData);

    res.status(200).json({
      message: 'CSV uploaded and data saved to database',
      count: formattedData.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

// GET route to fetch available tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find({ available: true });
    res.status(200).json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

module.exports = router;
