// backend/utils/csvParser.js
const { parse } = require('csv-parse/sync');

/**
 * Parse CSV of table definitions.
 * Expected headers: table_id,type,capacity,location
 */
function parseCsv(text) {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

module.exports = parseCsv;
