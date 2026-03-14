const pool = require('../config/db');

// GET /api/warehouses
exports.getWarehouses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses ORDER BY name ASC');
    res.json({ warehouses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};
