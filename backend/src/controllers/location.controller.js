const pool = require('../config/db');

// GET /api/locations
exports.getLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, w.name as warehouse_name 
      FROM locations l
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY l.name ASC
    `);
    res.json({ locations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

// POST /api/locations
exports.createLocation = async (req, res) => {
  const { name, code, warehouse_id } = req.body;
  if (!name || !code || !warehouse_id) {
    return res.status(400).json({ error: 'Name, Short Code, and Warehouse are required.' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO locations (name, code, warehouse_id) VALUES ($1, $2, $3) RETURNING *',
      [name, code, warehouse_id]
    );
    res.status(201).json({ message: 'Location created', location: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.constraint === 'locations_code_key' || err.constraint === 'locations_code_unique') {
      return res.status(400).json({ error: 'Location short code already exists' });
    }
    res.status(500).json({ error: 'Failed to create location' });
  }
};
