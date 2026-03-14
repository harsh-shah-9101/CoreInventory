const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  console.log('Running schema migration...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      location VARCHAR(255)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      qty_on_hand INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 10,
      warehouse_id INTEGER REFERENCES warehouses(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS receipts (
      id SERIAL PRIMARY KEY,
      reference VARCHAR(100) UNIQUE NOT NULL,
      product_id INTEGER REFERENCES products(id),
      qty INTEGER NOT NULL,
      warehouse_id INTEGER REFERENCES warehouses(id),
      status VARCHAR(50) DEFAULT 'Draft',
      scheduled_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id SERIAL PRIMARY KEY,
      reference VARCHAR(100) UNIQUE NOT NULL,
      product_id INTEGER REFERENCES products(id),
      qty INTEGER NOT NULL,
      warehouse_id INTEGER REFERENCES warehouses(id),
      status VARCHAR(50) DEFAULT 'Draft',
      scheduled_date DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

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

  console.log('Schema migration complete.');

  // Seed sample data
  console.log('Seeding sample data...');

  // Categories
  await client.query(`INSERT INTO categories (name) VALUES ('Electronics'), ('Furniture'), ('Clothing') ON CONFLICT DO NOTHING`);

  // Warehouses
  await client.query(`INSERT INTO warehouses (name, location) VALUES ('Main Warehouse', 'Building A'), ('Secondary Warehouse', 'Building B') ON CONFLICT DO NOTHING`);

  // Get IDs
  const cats = await client.query(`SELECT id FROM categories LIMIT 3`);
  const wars = await client.query(`SELECT id FROM warehouses LIMIT 2`);
  const catIds = cats.rows.map(r => r.id);
  const warIds = wars.rows.map(r => r.id);

  // Products
  const products = [
    { name: 'Laptop Pro', sku: 'LAP-001', cat: catIds[0], qty: 50, reorder: 10, war: warIds[0] },
    { name: 'Office Chair', sku: 'CHR-002', cat: catIds[1], qty: 8, reorder: 15, war: warIds[0] },
    { name: 'T-Shirt XL', sku: 'TSH-003', cat: catIds[2], qty: 0, reorder: 20, war: warIds[1] },
    { name: 'Monitor 27"', sku: 'MON-004', cat: catIds[0], qty: 25, reorder: 5, war: warIds[0] },
    { name: 'Standing Desk', sku: 'DSK-005', cat: catIds[1], qty: 3, reorder: 5, war: warIds[1] },
    { name: 'USB Hub', sku: 'USB-006', cat: catIds[0], qty: 100, reorder: 20, war: warIds[0] },
  ];

  for (const p of products) {
    await client.query(
      `INSERT INTO products (name, sku, category_id, qty_on_hand, reorder_level, warehouse_id) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [p.name, p.sku, p.cat, p.qty, p.reorder, p.war]
    );
  }

  const prods = await client.query(`SELECT id FROM products LIMIT 6`);
  const pIds = prods.rows.map(r => r.id);

  // Receipts
  const receiptData = [
    ['REC-001', pIds[0], 20, warIds[0], 'Waiting', '2026-03-15'],
    ['REC-002', pIds[1], 10, warIds[0], 'Ready',   '2026-03-16'],
    ['REC-003', pIds[2], 50, warIds[1], 'Draft',   '2026-03-17'],
    ['REC-004', pIds[3], 15, warIds[0], 'Done',    '2026-03-10'],
  ];
  for (const r of receiptData) {
    await client.query(
      `INSERT INTO receipts (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      r
    );
  }

  // Deliveries
  const deliveryData = [
    ['DEL-001', pIds[0], 5, warIds[0],  'Ready',    '2026-03-14'],
    ['DEL-002', pIds[3], 3, warIds[0],  'Waiting',  '2026-03-15'],
    ['DEL-003', pIds[5], 10, warIds[0], 'Done',     '2026-03-12'],
    ['DEL-004', pIds[2], 2, warIds[1],  'Canceled', '2026-03-11'],
  ];
  for (const d of deliveryData) {
    await client.query(
      `INSERT INTO deliveries (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      d
    );
  }

  // Transfers
  const transferData = [
    ['TRF-001', pIds[1], 5, warIds[0], warIds[1], 'Ready',   '2026-03-15'],
    ['TRF-002', pIds[4], 2, warIds[1], warIds[0], 'Draft',   '2026-03-16'],
    ['TRF-003', pIds[0], 8, warIds[0], warIds[1], 'Waiting', '2026-03-17'],
  ];
  for (const t of transferData) {
    await client.query(
      `INSERT INTO transfers (reference, product_id, qty, from_warehouse_id, to_warehouse_id, status, scheduled_date) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      t
    );
  }

  // Adjustments
  const adjData = [
    ['ADJ-001', pIds[2], -5, warIds[1], 'Damaged goods', 'Done'],
    ['ADJ-002', pIds[5], 10, warIds[0], 'Stock count correction', 'Draft'],
  ];
  for (const a of adjData) {
    await client.query(
      `INSERT INTO adjustments (reference, product_id, qty_change, warehouse_id, reason, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      a
    );
  }

  console.log('Seed complete.');
  await client.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
