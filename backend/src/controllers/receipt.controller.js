const pool = require('../config/db');

// List Receipts
exports.getReceipts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name AS product_name, w.name AS warehouse_name
      FROM receipts r
      JOIN products p ON p.id = r.product_id
      JOIN warehouses w ON w.id = r.warehouse_id
      ORDER BY r.created_at DESC
    `);
    res.json({ receipts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
};

// Create Draft Receipt
exports.createReceipt = async (req, res) => {
  const { productId, warehouseId, qty, scheduledDate } = req.body;
  if (!productId || !warehouseId || !qty) {
    return res.status(400).json({ error: 'Product, Warehouse, and Quantity are required' });
  }

  try {
    const reference = 'REC-' + Date.now().toString().slice(-6);
    const result = await pool.query(
      `INSERT INTO receipts (reference, product_id, warehouse_id, qty, status, scheduled_date)
       VALUES ($1, $2, $3, $4, 'Draft', $5) RETURNING *`,
      [reference, productId, warehouseId, qty, scheduledDate || new Date()]
    );
    res.status(201).json({ receipt: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
};

// Validate Receipt (Move Stock)
exports.validateReceipt = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('BEGIN'); // Start transaction

    // Get receipt details
    const receiptRes = await pool.query('SELECT * FROM receipts WHERE id = $1', [id]);
    if (receiptRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Receipt not found' });
    }
    const receipt = receiptRes.rows[0];

    // Check if already done
    if (receipt.status === 'Done') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Receipt is already validated' });
    }

    // Insert into stock_ledger
    await pool.query(`
      INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
      VALUES ($1, $2, 'RECEIPT', $3, 'receipts', $4)
    `, [receipt.product_id, receipt.warehouse_id, receipt.qty, receipt.reference]);

    // Update receipt status
    const updatedReceiptRes = await pool.query(
      "UPDATE receipts SET status = 'Done' WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query('COMMIT'); // Commit transaction
    res.json({ receipt: updatedReceiptRes.rows[0], message: 'Receipt validated and stock updated' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to validate receipt' });
  }
};
