const pool = require('./src/config/db');

async function alter() {
  try {
    await pool.query('ALTER TABLE receipts ADD COLUMN IF NOT EXISTS destination_location_id INTEGER REFERENCES locations(id);');
    await pool.query('ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS source_location_id INTEGER REFERENCES locations(id);');
    await pool.query('ALTER TABLE transfers ADD COLUMN IF NOT EXISTS from_location_id INTEGER REFERENCES locations(id);');
    await pool.query('ALTER TABLE transfers ADD COLUMN IF NOT EXISTS to_location_id INTEGER REFERENCES locations(id);');
    await pool.query('ALTER TABLE adjustments ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id);');
    console.log('Tables altered successfully!');
  } catch (err) {
    console.error('Error altering tables:', err);
  } finally {
    pool.end();
  }
}
alter();