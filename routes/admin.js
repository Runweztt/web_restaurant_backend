// backend/routes/admin.js
const express = require('express');
const multer = require('multer');
const { processCsvAndUpsert } = require('../controllers/tableController');

const router = express.Router();
const upload = multer(); // memory-based file upload

// Upload CSV endpoint: admin uploads table definitions
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const csvText = req.file.buffer.toString('utf-8');

    // Process CSV and upsert definitions
    const allTables = await processCsvAndUpsert(csvText);

    // Emit realtime event to clients
    const io = req.app.get('io');
    io.emit('tables:definitions-updated', allTables);

    return res.json({ success: true, data: allTables });
  } catch (err) {
    console.error('Error in /admin/upload-csv:', err);
    return res.status(500).json({ error: 'Failed to process CSV' });
  }
});


module.exports = router;
