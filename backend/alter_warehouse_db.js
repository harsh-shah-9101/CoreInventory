const pool = require('./src/config/db');

async function alterDB() {
  try {
    console.log('Altering warehouses...');
    await pool.query('ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS code VARCHAR(50);');
    await pool.query('ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS address TEXT;');
    
    // Add unique constraint separately to handle already existing unique codes if we run the script multiple times
    try {
      await pool.query('ALTER TABLE warehouses ADD CONSTRAINT unique_warehouse_code UNIQUE (code);');
    } catch (err) {
      if (err.code !== '42P16') { // 42P16: invalid_table_definition (constraint already exists)
        throw err;
      }
    }
    
    console.log('Database modification for warehouses complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error altering DB:', err);
    process.exit(1);
  }
}

alterDB();
