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

// POST /api/warehouses
exports.createWarehouse = async (req, res) => {
  const { name, code, address } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and Short Code are required.' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING *',
      [name, code, address]
    );
    res.status(201).json({ message: 'Warehouse created', warehouse: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.constraint === 'warehouses_name_key') {
      return res.status(400).json({ error: 'Warehouse name already exists' });
    }
    if (err.constraint === 'unique_warehouse_code') {
      return res.status(400).json({ error: 'Warehouse short code already exists' });
    }
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};
