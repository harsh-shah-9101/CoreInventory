const pool = require('../config/db');

// List Transfers
exports.getTransfers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name AS product_name, p.category_id, w1.name AS from_warehouse_name, w2.name AS to_warehouse_name,
             l1.name AS from_location_name, l2.name AS to_location_name
      FROM transfers t
      JOIN products p ON p.id = t.product_id
      JOIN warehouses w1 ON w1.id = t.from_warehouse_id
      JOIN warehouses w2 ON w2.id = t.to_warehouse_id
      LEFT JOIN locations l1 ON l1.id = t.from_location_id
      LEFT JOIN locations l2 ON l2.id = t.to_location_id
      ORDER BY t.created_at DESC
    `);
    res.json({ transfers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
};

// Create Draft Transfer
exports.createTransfer = async (req, res) => {
  const { productId, fromWarehouseId, toWarehouseId, qty, scheduledDate, from_location_id, to_location_id } = req.body;
  
  if (!productId || !fromWarehouseId || !toWarehouseId || !qty) {
    return res.status(400).json({ error: 'Product, Source Warehouse, Destination Warehouse, and Quantity are required' });
  }

  if (fromWarehouseId === toWarehouseId && (!from_location_id || !to_location_id || from_location_id === to_location_id)) {
     return res.status(400).json({ error: 'Must transfer to a different warehouse or a different location within the same warehouse' });
  }

  try {
    const reference = 'TRF-' + Date.now().toString().slice(-6);
    const result = await pool.query(
      `INSERT INTO transfers (reference, product_id, from_warehouse_id, to_warehouse_id, qty, status, scheduled_date, from_location_id, to_location_id)
       VALUES ($1, $2, $3, $4, $5, 'Draft', $6, $7, $8) RETURNING *`,
      [reference, productId, fromWarehouseId, toWarehouseId, qty, scheduledDate || new Date(), from_location_id || null, to_location_id || null]
    );
    res.status(201).json({ transfer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
};

// Validate Transfer (Move Stock)
exports.validateTransfer = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('BEGIN'); 

    // Get transfer details
    const transferRes = await pool.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (transferRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Transfer not found' });
    }
    const transfer = transferRes.rows[0];

    // Check if already done
    if (transfer.status === 'Done') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Transfer is already validated' });
    }

    // Check available stock at source
    let stockQuery = 'SELECT SUM(calculated_qty) as calculated_qty FROM current_location_stock_view WHERE product_id = $1 AND warehouse_id = $2';
    let queryParams = [transfer.product_id, transfer.from_warehouse_id];
    
    if (transfer.from_location_id) {
      stockQuery += ' AND location_id = $3';
      queryParams.push(transfer.from_location_id);
    }

    const stockRes = await pool.query(stockQuery, queryParams);

    const currentStock = stockRes.rows.length > 0 ? (stockRes.rows[0].calculated_qty || 0) : 0;

    if (currentStock < transfer.qty) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: `Not enough stock at source. Available: ${currentStock}, Requested: ${transfer.qty}` });
    }

    // Insert OUT row into stock_ledger (Source)
    await pool.query(`
      INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, location_id)
      VALUES ($1, $2, 'TRANSFER_OUT', $3, 'transfers', $4, $5)
    `, [transfer.product_id, transfer.from_warehouse_id, -transfer.qty, transfer.reference, transfer.from_location_id]);

    // Insert IN row into stock_ledger (Destination)
     await pool.query(`
      INSERT INTO stock_ledger (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, location_id)
      VALUES ($1, $2, 'TRANSFER_IN', $3, 'transfers', $4, $5)
    `, [transfer.product_id, transfer.to_warehouse_id, transfer.qty, transfer.reference, transfer.to_location_id]);


    // Update transfer status
    const updatedTransferRes = await pool.query(
      "UPDATE transfers SET status = 'Done' WHERE id = $1 RETURNING *",
      [id]
    );

    await pool.query('COMMIT'); 
    res.json({ transfer: updatedTransferRes.rows[0], message: 'Transfer validated and stock moved' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to validate transfer' });
  }
};
