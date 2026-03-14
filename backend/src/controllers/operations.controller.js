const pool = require('../config/db');

const TABLES = {
  receipts:    { table: 'receipts',    allowed: { manager: ['Draft','Waiting','Ready','Done','Canceled'], warehouse_staff: [] } },
  deliveries:  { table: 'deliveries',  allowed: { manager: ['Draft','Waiting','Ready','Done','Canceled'], warehouse_staff: ['Done','Canceled'] } },
  transfers:   { table: 'transfers',   allowed: { manager: ['Draft','Waiting','Ready','Done','Canceled'], warehouse_staff: ['Draft','Waiting','Ready','Done','Canceled'] } },
  adjustments: { table: 'adjustments', allowed: { manager: ['Draft','Done','Canceled'], warehouse_staff: ['Draft','Done','Canceled'] } },
};

const VALID_STATUSES = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

// PATCH /api/operations/:type/:id/status
exports.updateStatus = async (req, res) => {
  const { type, id } = req.params;
  const { status } = req.body;
  const userRole = req.session?.user?.role || 'manager';

  const config = TABLES[type];
  if (!config) return res.status(400).json({ error: 'Invalid operation type' });
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const allowedStatuses = config.allowed[userRole];
  if (allowedStatuses.length > 0 && !allowedStatuses.includes(status)) {
    return res.status(403).json({ error: `Your role cannot set status to "${status}" for ${type}` });
  }

  try {
    const result = await pool.query(
      `UPDATE ${config.table} SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Status updated', record: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// GET /api/operations/history
exports.getHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.created_at AS date, r.reference, p.name AS product, NULL AS from_location, w.name AS to_location, r.qty, 'Receipt' AS type, u.name AS contact, r.status
      FROM receipts r
      JOIN products p ON p.id = r.product_id
      JOIN warehouses w ON w.id = r.warehouse_id
      LEFT JOIN users u ON u.id = 1 -- Placeholder for simplicity
      
      UNION ALL
      
      SELECT d.created_at AS date, d.reference, p.name AS product, w.name AS from_location, NULL AS to_location, d.qty, 'Delivery' AS type, u.name AS contact, d.status
      FROM deliveries d
      JOIN products p ON p.id = d.product_id
      JOIN warehouses w ON w.id = d.warehouse_id
      LEFT JOIN users u ON u.id = 1
      
      UNION ALL
      
      SELECT t.created_at AS date, t.reference, p.name AS product, fw.name AS from_location, tw.name AS to_location, t.qty, 'Transfer' AS type, u.name AS contact, t.status
      FROM transfers t
      JOIN products p ON p.id = t.product_id
      JOIN warehouses fw ON fw.id = t.from_warehouse_id
      JOIN warehouses tw ON tw.id = t.to_warehouse_id
      LEFT JOIN users u ON u.id = 1
      
      UNION ALL
      
      SELECT a.created_at AS date, a.reference, p.name AS product, NULL AS from_location, w.name AS to_location, a.qty_change AS qty, 'Adjustment' AS type, u.name AS contact, a.status
      FROM adjustments a
      JOIN products p ON p.id = a.product_id
      JOIN warehouses w ON w.id = a.warehouse_id
      LEFT JOIN users u ON u.id = 1
      
      ORDER BY date DESC
      LIMIT 200
    `);
    res.json({ history: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch operation history' });
  }
};
