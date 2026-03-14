const pool = require('../config/db');

// GET /api/dashboard/stats
// Returns KPI counts, filters by doc type, status, warehouse, category
exports.getStats = async (req, res) => {
  const { docType, status, warehouseId, categoryId } = req.query;

  try {
    // --- KPI 1: Total Products in Stock ---
    const totalProducts = await pool.query(`SELECT COUNT(*) AS count FROM products WHERE qty_on_hand > 0`);

    // --- KPI 2: Low Stock (qty < reorder_level but > 0) ---
    const lowStock = await pool.query(`SELECT COUNT(*) AS count FROM products WHERE qty_on_hand > 0 AND qty_on_hand <= reorder_level`);

    // --- KPI 3: Out of Stock ---
    const outOfStock = await pool.query(`SELECT COUNT(*) AS count FROM products WHERE qty_on_hand = 0`);

    // --- KPI 4: Pending Receipts ---
    const pendingReceipts = await pool.query(`SELECT COUNT(*) AS count FROM receipts WHERE status NOT IN ('Done', 'Canceled')`);

    // --- KPI 5: Pending Deliveries ---
    const pendingDeliveries = await pool.query(`SELECT COUNT(*) AS count FROM deliveries WHERE status NOT IN ('Done', 'Canceled')`);

    // --- KPI 6: Scheduled Transfers ---
    const scheduledTransfers = await pool.query(`SELECT COUNT(*) AS count FROM transfers WHERE status NOT IN ('Done', 'Canceled')`);

    // --- Recent Operations (filtered) ---
    let operations = [];

    const buildFilter = (statusCol, warehouseCol) => {
      const conditions = [];
      const values = [];
      let idx = 1;
      if (status) { conditions.push(`${statusCol} = $${idx++}`); values.push(status); }
      if (warehouseId) { conditions.push(`${warehouseCol} = $${idx++}`); values.push(warehouseId); }
      return { where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '', values };
    };

    if (!docType || docType === 'Receipts') {
      const f = buildFilter('r.status', 'r.warehouse_id');
      const catFilter = categoryId ? ` AND p.category_id = ${parseInt(categoryId)}` : '';
      const rows = await pool.query(`
        SELECT r.id, 'Receipt' AS type, r.reference, p.name AS product, r.qty, w.name AS warehouse, p.category_id, r.status, r.scheduled_date
        FROM receipts r
        JOIN products p ON p.id = r.product_id
        JOIN warehouses w ON w.id = r.warehouse_id
        ${f.where} ${catFilter}
        ORDER BY r.created_at DESC LIMIT 20
      `, f.values);
      operations = [...operations, ...rows.rows];
    }

    if (!docType || docType === 'Delivery') {
      const f = buildFilter('d.status', 'd.warehouse_id');
      const catFilter = categoryId ? ` AND p.category_id = ${parseInt(categoryId)}` : '';
      const rows = await pool.query(`
        SELECT d.id, 'Delivery' AS type, d.reference, p.name AS product, d.qty, w.name AS warehouse, p.category_id, d.status, d.scheduled_date
        FROM deliveries d
        JOIN products p ON p.id = d.product_id
        JOIN warehouses w ON w.id = d.warehouse_id
        ${f.where} ${catFilter}
        ORDER BY d.created_at DESC LIMIT 20
      `, f.values);
      operations = [...operations, ...rows.rows];
    }

    if (!docType || docType === 'Internal') {
      const f = buildFilter('t.status', 't.from_warehouse_id');
      const catFilter = categoryId ? ` AND p.category_id = ${parseInt(categoryId)}` : '';
      const rows = await pool.query(`
        SELECT t.id, 'Transfer' AS type, t.reference, p.name AS product, t.qty, fw.name AS warehouse, p.category_id, t.status, t.scheduled_date
        FROM transfers t
        JOIN products p ON p.id = t.product_id
        JOIN warehouses fw ON fw.id = t.from_warehouse_id
        ${f.where} ${catFilter}
        ORDER BY t.created_at DESC LIMIT 20
      `, f.values);
      operations = [...operations, ...rows.rows];
    }

    if (!docType || docType === 'Adjustments') {
      const f = buildFilter('a.status', 'a.warehouse_id');
      const catFilter = categoryId ? ` AND p.category_id = ${parseInt(categoryId)}` : '';
      const rows = await pool.query(`
        SELECT a.id, 'Adjustment' AS type, a.reference, p.name AS product, a.qty_change AS qty, w.name AS warehouse, p.category_id, a.status, a.created_at AS scheduled_date
        FROM adjustments a
        JOIN products p ON p.id = a.product_id
        JOIN warehouses w ON w.id = a.warehouse_id
        ${f.where} ${catFilter}
        ORDER BY a.created_at DESC LIMIT 20
      `, f.values);
      operations = [...operations, ...rows.rows];
    }

    // Sort all operations by date
    operations.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));

    // Warehouses and categories for filter dropdowns
    const warehouses = await pool.query(`SELECT id, name FROM warehouses ORDER BY name`);
    const categories = await pool.query(`SELECT id, name FROM categories ORDER BY name`);

    res.json({
      kpis: {
        totalProducts: parseInt(totalProducts.rows[0].count),
        lowStock: parseInt(lowStock.rows[0].count),
        outOfStock: parseInt(outOfStock.rows[0].count),
        pendingReceipts: parseInt(pendingReceipts.rows[0].count),
        pendingDeliveries: parseInt(pendingDeliveries.rows[0].count),
        scheduledTransfers: parseInt(scheduledTransfers.rows[0].count),
      },
      operations,
      warehouses: warehouses.rows,
      categories: categories.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
