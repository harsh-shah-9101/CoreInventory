const pool = require('../config/db');

// List Adjustments
exports.getAdjustments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.name AS product_name, w.name AS warehouse_name
      FROM adjustments a
      JOIN products p ON p.id = a.product_id
      JOIN warehouses w ON w.id = a.warehouse_id
      ORDER BY a.created_at DESC
    `);
    res.json({ adjustments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
};

// Create Draft Adjustment
exports.createAdjustment = async (req, res) => {
  // qtyChange is the EXACT difference to adjust by.
  // e.g., if System says 100, but physical count is 95, qtyChange should be -5.
  const { productId, warehouseId, qtyChange, reason } = req.body;
  if (!productId || !warehouseId || qtyChange === undefined || !reason) {
    return res.status(400).json({ error: 'Product, Warehouse, Quantity Change, and Reason are required' });
  }

  if (qtyChange === 0) {
     return res.status(400).json({ error: 'Quantity change cannot be zero.' });
  }

  try {
    const reference = 'ADJ-' + Date.now().toString().slice(-6);
    const result = await pool.query(
      `INSERT INTO adjustments (reference, product_id, warehouse_id, qty_change, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'Draft') RETURNING *`,
      [reference, productId, warehouseId, qtyChange, reason]
    );
    res.status(201).json({ adjustment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create adjustment' });
  }
};

// Validate Adjustment (Move Stock)
exports.validateAdjustment = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('BEGIN'); // Start transaction

    // Get adjustment details
    const adjRes = await pool.query('SELECT * FROM adjustments WHERE id = $1', [id]);
    if (adjRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Adjustment not found' });
    }
    const adjustment = adjRes.rows[0];

    // Check if already done
    if (adjustment.status === 'Done') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Adjustment is already validated' });
    }

    // Insert into stock_ledger
    await pool.query(`
      INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
      VALUES ($1, $2, 'ADJUSTMENT', $3, 'adjustments', $4)
    `, [adjustment.product_id, adjustment.warehouse_id, adjustment.qty_change, adjustment.reference]);

    // Update adjustment status
    const updatedAdjRes = await pool.query(
      "UPDATE adjustments SET status = 'Done' WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query('COMMIT'); // Commit transaction
    res.json({ adjustment: updatedAdjRes.rows[0], message: 'Adjustment validated and stock corrected' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to validate adjustment' });
  }
};
