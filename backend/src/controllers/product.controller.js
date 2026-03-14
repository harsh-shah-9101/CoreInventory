const pool = require('../config/db');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category 
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `);
    res.json({ products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  const { name, sku, category, qty, price } = req.body;
  try {
    // Basic implementation: Find or create category (simplified)
    let categoryId = null;
    if (category) {
      const catRes = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
      if (catRes.rows.length) {
        categoryId = catRes.rows[0].id;
      } else {
        const newCat = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
        categoryId = newCat.rows[0].id;
      }
    }

    const result = await pool.query(
      'INSERT INTO products (name, sku, category_id, qty_on_hand, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [name, sku, categoryId, qty || 0]
    );
    res.status(21).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// GET /api/products/stock
exports.getStockByLocation = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name AS product, w.name AS warehouse, w.location, p.qty_on_hand AS available
      FROM products p
      LEFT JOIN warehouses w ON w.id = p.warehouse_id
      ORDER BY p.name ASC
    `);
    res.json({ stock: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

// GET /api/products/reorder-rules
exports.getReorderRules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name AS product, p.reorder_level AS min_qty, p.qty_on_hand AS current_qty
      FROM products p
      WHERE p.qty_on_hand <= p.reorder_level
    `);
    res.json({ rules: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reorder rules' });
  }
};
