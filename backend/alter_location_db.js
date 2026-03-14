const pool = require('./src/config/db');

async function alterDB() {
  try {
    console.log('Creating locations table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database modification for locations complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error altering DB:', err);
    process.exit(1);
  }
}

alterDB();
