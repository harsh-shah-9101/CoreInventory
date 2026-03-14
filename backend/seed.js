const { Client } = require('pg');
require('dotenv').config();

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  
  console.log("Seeding real working data based on Problem Statement...");

  // clear tables mapping backwards
  await client.query("DELETE FROM adjustments;");
  await client.query("DELETE FROM transfers;");
  await client.query("DELETE FROM deliveries;");
  await client.query("DELETE FROM receipts;");
  await client.query("DELETE FROM product_stock;");
  await client.query("DELETE FROM reorder_rules;");
  await client.query("DELETE FROM products;");
  await client.query("DELETE FROM locations;");
  await client.query("DELETE FROM warehouses;");
  await client.query("DELETE FROM categories;");

  // insert Warehouses
  const w_mainRes = await client.query("INSERT INTO warehouses (name, code, location) VALUES ('Main Store', 'WH-MAIN', 'Main Facility') RETURNING id;");
  const w_prodRes = await client.query("INSERT INTO warehouses (name, code, location) VALUES ('Production Floor', 'WH-PROD', 'Factory A') RETURNING id;");
  const w_wh1Res = await client.query("INSERT INTO warehouses (name, code, location) VALUES ('Warehouse 1', 'WH-1', 'East Wing') RETURNING id;");
  const w_wh2Res = await client.query("INSERT INTO warehouses (name, code, location) VALUES ('Warehouse 2', 'WH-2', 'West Wing') RETURNING id;");
  
  const whMainId = w_mainRes.rows[0].id;
  const whProdId = w_prodRes.rows[0].id;
  const wh1Id = w_wh1Res.rows[0].id;
  const wh2Id = w_wh2Res.rows[0].id;

  // Insert Sub-locations (Racks)
  await client.query(`INSERT INTO locations (name, code, warehouse_id) VALUES ('Rack A', 'RCK-A', ${whMainId});`);
  await client.query(`INSERT INTO locations (name, code, warehouse_id) VALUES ('Rack B', 'RCK-B', ${wh1Id});`);
  await client.query(`INSERT INTO locations (name, code, warehouse_id) VALUES ('Production Rack', 'PRD-RCK', ${whProdId});`);

  // insert Categories
  const catRawRes = await client.query("INSERT INTO categories (name, description) VALUES ('Raw Materials', 'Unprocessed items') RETURNING id;");
  const catFinRes = await client.query("INSERT INTO categories (name, description) VALUES ('Finished Goods', 'Products ready for sale') RETURNING id;");
  const catRawId = catRawRes.rows[0].id;
  const catFinId = catFinRes.rows[0].id;

  // Insert Products
  // "Steel" Start: 100 -> Transfer: no qty change -> Deliver: -20 -> Adjust: -3 == 77 total
  const ptSteelRes = await client.query(`INSERT INTO products (name, sku, category_id, qty_on_hand, reorder_level, price) VALUES ('Steel', 'STL-001', ${catRawId}, 77, 20, 150.00) RETURNING id;`);
  
  // "Steel Rods" Start: 0 -> Receive 50
  const ptRodsRes = await client.query(`INSERT INTO products (name, sku, category_id, qty_on_hand, reorder_level, price) VALUES ('Steel Rods', 'STL-ROD-01', ${catRawId}, 50, 10, 50.00) RETURNING id;`);
  
  // "Chairs" assumed start 100 -> Deliver 10 -> 90
  const ptChairsRes = await client.query(`INSERT INTO products (name, sku, category_id, qty_on_hand, reorder_level, price) VALUES ('Chairs', 'CHR-001', ${catFinId}, 90, 15, 200.00) RETURNING id;`); 

  const ptSteelId = ptSteelRes.rows[0].id;
  const ptRodsId = ptRodsRes.rows[0].id;
  const ptChairsId = ptChairsRes.rows[0].id;

  // Stock entries
  await client.query(`INSERT INTO product_stock (product_id, warehouse_id, qty) VALUES (${ptSteelId}, ${whMainId}, 27)`); // 100 received -> 50 transferred -> 20 delivered -> 3 damaged = 27 left at Main Store
  await client.query(`INSERT INTO product_stock (product_id, warehouse_id, qty) VALUES (${ptSteelId}, ${whProdId}, 50)`); // 50 transferred here
  await client.query(`INSERT INTO product_stock (product_id, warehouse_id, qty) VALUES (${ptRodsId}, ${whMainId}, 50)`);
  await client.query(`INSERT INTO product_stock (product_id, warehouse_id, qty) VALUES (${ptChairsId}, ${whProdId}, 90)`);

  // Receipts (Step 1 & 2 logic)
  await client.query(`INSERT INTO receipts (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('REC-001', ${ptSteelId}, 100, ${whMainId}, 'Done', NOW() - INTERVAL '5 days');`);
  await client.query(`INSERT INTO receipts (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('REC-002', ${ptRodsId}, 50, ${whMainId}, 'Done', NOW() - INTERVAL '3 days');`);

  // Deliveries (Step 3 logic)
  await client.query(`INSERT INTO deliveries (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('DEL-001', ${ptSteelId}, 20, ${whMainId}, 'Done', NOW() - INTERVAL '2 days');`);
  await client.query(`INSERT INTO deliveries (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('DEL-002', ${ptChairsId}, 10, ${whProdId}, 'Done', NOW() - INTERVAL '1 days');`);

  // Transfers
  await client.query(`INSERT INTO transfers (reference, product_id, qty, from_warehouse_id, to_warehouse_id, status, scheduled_date) VALUES ('TRF-001', ${ptSteelId}, 50, ${whMainId}, ${whProdId}, 'Done', NOW() - INTERVAL '4 days');`);

  // Adjustments (Step 4 logic)
  await client.query(`INSERT INTO adjustments (reference, product_id, qty_change, warehouse_id, reason, status) VALUES ('ADJ-001', ${ptSteelId}, -3, ${whMainId}, 'Damaged stock', 'Done');`);

  // Pending items for Dashboard to look populated with pending tasks
  await client.query(`INSERT INTO receipts (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('REC-003', ${ptChairsId}, 50, ${whProdId}, 'Waiting', NOW() + INTERVAL '1 days');`);
  await client.query(`INSERT INTO receipts (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('REC-004', ${ptRodsId}, 100, ${whMainId}, 'Draft', NOW() + INTERVAL '2 days');`);
  
  await client.query(`INSERT INTO deliveries (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('DEL-003', ${ptRodsId}, 10, ${whMainId}, 'Ready', NOW() + INTERVAL '1 days');`);
  await client.query(`INSERT INTO deliveries (reference, product_id, qty, warehouse_id, status, scheduled_date) VALUES ('DEL-004', ${ptSteelId}, 5, ${whMainId}, 'Waiting', NOW() + INTERVAL '2 days');`);

  await client.query(`INSERT INTO transfers (reference, product_id, qty, from_warehouse_id, to_warehouse_id, status, scheduled_date) VALUES ('TRF-002', ${ptRodsId}, 20, ${whMainId}, ${wh1Id}, 'Draft', NOW() + INTERVAL '1 days');`);

  console.log("Database seeded successfully with working data!");
  await client.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
