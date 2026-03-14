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
