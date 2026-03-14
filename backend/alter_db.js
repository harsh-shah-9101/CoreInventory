const pool = require('./src/config/db');

async function alterDB() {
  try {
    console.log('Altering categories...');
    await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;');
    
    console.log('Altering products...');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;');
    
    console.log('Creating product_stock...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        warehouse_id INTEGER REFERENCES warehouses(id),
        qty INTEGER DEFAULT 0,
        UNIQUE(product_id, warehouse_id)
      );
    `);
    
    console.log('Creating reorder_rules...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reorder_rules (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        min_qty INTEGER DEFAULT 0,
        max_qty INTEGER DEFAULT 0,
        reorder_qty INTEGER DEFAULT 0,
        UNIQUE(product_id)
      );
    `);
    
    console.log('Database modification complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error altering DB:', err);
    process.exit(1);
  }
}

alterDB();
