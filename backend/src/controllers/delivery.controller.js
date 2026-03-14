const pool = require('../config/db');

exports.getDeliveries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.name AS product_name, w.name AS warehouse_name
      FROM deliveries d
      JOIN products p ON p.id = d.product_id
      JOIN warehouses w ON w.id = d.warehouse_id
      ORDER BY d.created_at DESC
    `);
    res.json({ deliveries: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

exports.createDelivery = async (req, res) => {
  const { productId, warehouseId, qty, scheduledDate } = req.body;
  if (!productId || !warehouseId || !qty) {
    return res.status(400).json({ error: 'Product, Warehouse, and Quantity are required' });
  }

  try {
    const reference = 'DEL-' + Date.now().toString().slice(-6); // Simple random ref
    const result = await pool.query(
      `INSERT INTO deliveries (reference, product_id, warehouse_id, qty, status, scheduled_date)
       VALUES ($1, $2, $3, $4, 'Draft', $5) RETURNING *`,
      [reference, productId, warehouseId, qty, scheduledDate || new Date()]
    );
    res.status(201).json({ delivery: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create delivery order' });
  }
};
