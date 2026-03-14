const { Client } = require('pg');
require('dotenv').config();

async function alterLedgerDb() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Running stock ledger migration...');

    // 1. Create stock_ledger table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_ledger (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        warehouse_id INTEGER REFERENCES warehouses(id),
        movement_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(50) NOT NULL,
        reference_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Create current_stock_view
    await client.query(`
      CREATE OR REPLACE VIEW current_stock_view AS
      SELECT 
        product_id,
        warehouse_id,
        SUM(quantity) as calculated_qty
      FROM stock_ledger
      GROUP BY product_id, warehouse_id
    `);

    // 3. Ensure transfers and adjustments have the right schema (from migrate.js)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        product_id INTEGER REFERENCES products(id),
        qty INTEGER NOT NULL,
        from_warehouse_id INTEGER REFERENCES warehouses(id),
        to_warehouse_id INTEGER REFERENCES warehouses(id),
        status VARCHAR(50) DEFAULT 'Draft',
        scheduled_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS adjustments (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(100) UNIQUE NOT NULL,
        product_id INTEGER REFERENCES products(id),
        qty_change INTEGER NOT NULL,
        warehouse_id INTEGER REFERENCES warehouses(id),
        reason TEXT,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. Add unit_of_measure to products if it doesn't exist
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50) DEFAULT 'Units'
    `);

    // 5. Migrate existing mock qty_on_hand into the ledger as initial inventory
    console.log('Migrating existing product stock into ledger...');
    const productsRes = await client.query('SELECT id, qty_on_hand, warehouse_id FROM products WHERE qty_on_hand > 0 AND warehouse_id IS NOT NULL');
    
    for (const p of productsRes.rows) {
      // Check if we already migrated this product
      const existing = await client.query(
        'SELECT id FROM stock_ledger WHERE product_id = $1 AND reference_type = $2',
        [p.id, 'initial_migration']
      );
      
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
          VALUES ($1, $2, 'RECEIPT', $3, 'initial_migration', 'MIG-001')
        `, [p.id, p.warehouse_id, p.qty_on_hand]);
      }
    }

    // 6. Migrate mock completed receipts/deliveries into ledger as well to make view accurate
    const completedReceipts = await client.query("SELECT * FROM receipts WHERE status = 'Done'");
    for (const r of completedReceipts.rows) {
      const existing = await client.query('SELECT id FROM stock_ledger WHERE reference_type = $1 AND reference_id = $2', ['receipts', r.reference]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at)
          VALUES ($1, $2, 'RECEIPT', $3, 'receipts', $4, $5)
        `, [r.product_id, r.warehouse_id, r.qty, r.reference, r.created_at || new Date()]);
      }
    }

    const completedDeliveries = await client.query("SELECT * FROM deliveries WHERE status = 'Done'");
    for (const d of completedDeliveries.rows) {
      const existing = await client.query('SELECT id FROM stock_ledger WHERE reference_type = $1 AND reference_id = $2', ['deliveries', d.reference]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at)
          VALUES ($1, $2, 'DELIVERY', $3, 'deliveries', $4, $5)
        `, [d.product_id, d.warehouse_id, -d.qty, d.reference, d.created_at || new Date()]);
      }
    }

    const completedTransfers = await client.query("SELECT * FROM transfers WHERE status = 'Done'");
     for (const t of completedTransfers.rows) {
      const existing = await client.query('SELECT id FROM stock_ledger WHERE reference_type = $1 AND reference_id = $2', ['transfers', t.reference]);
      if (existing.rows.length === 0) {
        // Out from source
        await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at)
          VALUES ($1, $2, 'TRANSFER_OUT', $3, 'transfers', $4, $5)
        `, [t.product_id, t.from_warehouse_id, -t.qty, t.reference, t.created_at || new Date()]);
        // In to destination
         await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at)
          VALUES ($1, $2, 'TRANSFER_IN', $3, 'transfers', $4, $5)
        `, [t.product_id, t.to_warehouse_id, t.qty, t.reference, t.created_at || new Date()]);
      }
    }

    const completedAdjustments = await client.query("SELECT * FROM adjustments WHERE status = 'Done'");
    for (const a of completedAdjustments.rows) {
      const existing = await client.query('SELECT id FROM stock_ledger WHERE reference_type = $1 AND reference_id = $2', ['adjustments', a.reference]);
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at)
          VALUES ($1, $2, 'ADJUSTMENT', $3, 'adjustments', $4, $5)
        `, [a.product_id, a.warehouse_id, a.qty_change, a.reference, a.created_at || new Date()]);
      }
    }

    console.log('Stock ledger migration complete.');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

alterLedgerDb();
