const pool = require('./src/config/db');

async function alter() {
  try {
    await pool.query('ALTER TABLE stock_ledger ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id);');
    
    await pool.query(`
      CREATE OR REPLACE VIEW current_location_stock_view AS
      SELECT 
        product_id,
        warehouse_id,
        location_id,
        SUM(quantity) as calculated_qty
      FROM stock_ledger
      GROUP BY product_id, warehouse_id, location_id;
    `);

    console.log('Ledger and views updated successfully!');
  } catch (err) {
    console.error('Error altering tables:', err);
  } finally {
    pool.end();
  }
}
alter();