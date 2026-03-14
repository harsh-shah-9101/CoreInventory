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
    const reference = 'DEL-' + Date.now().toString().slice(-6); 
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

// Validate Delivery (Move Stock)
exports.validateDelivery = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('BEGIN'); // Start transaction

    // Get delivery details
    const deliveryRes = await pool.query('SELECT * FROM deliveries WHERE id = $1', [id]);
    if (deliveryRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Delivery not found' });
    }
    const delivery = deliveryRes.rows[0];

    // Check if already done
    if (delivery.status === 'Done') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Delivery is already validated' });
    }

    // Check available stock from view
    const stockRes = await pool.query(
      'SELECT calculated_qty FROM current_stock_view WHERE product_id = $1 AND warehouse_id = $2',
      [delivery.product_id, delivery.warehouse_id]
    );

    const currentStock = stockRes.rows.length > 0 ? stockRes.rows[0].calculated_qty : 0;

    if (currentStock < delivery.qty) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: `Not enough stock. Available: ${currentStock}, Requested: ${delivery.qty}` });
    }

    // Insert into stock_ledger (Negative quantity for delivery)
    await pool.query(`
      INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
      VALUES ($1, $2, 'DELIVERY', $3, 'deliveries', $4)
    `, [delivery.product_id, delivery.warehouse_id, -delivery.qty, delivery.reference]);

    // ++ Update actual product stock
    await pool.query(
      "UPDATE products SET qty_on_hand = qty_on_hand - $1 WHERE id = $2",
      [delivery.qty, delivery.product_id]
    );

    // Update delivery status
    const updatedDeliveryRes = await pool.query(
      "UPDATE deliveries SET status = 'Done' WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query('COMMIT'); // Commit transaction
    res.json({ delivery: updatedDeliveryRes.rows[0], message: 'Delivery validated and stock updated' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to validate delivery' });
  }
};
