const pool = require('../config/db');

// List Ledger Entries
exports.getLedgerEntries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.*, 
        p.name AS product_name, 
        w.name AS warehouse_name
      FROM stock_ledger l
      JOIN products p ON p.id = l.product_id
      JOIN warehouses w ON w.id = l.warehouse_id
      ORDER BY l.created_at DESC
      LIMIT 500
    `);
    res.json({ ledger: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ledger entries' });
  }
};
