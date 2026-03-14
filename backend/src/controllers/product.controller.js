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
      'INSERT INTO products (name, sku, category_id, qty_on_hand, price, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, sku, categoryId, qty || 0, price || 0]
    );
    res.status(21).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, sku, category, qty, price } = req.body;
  try {
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
      'UPDATE products SET name = $1, sku = $2, category_id = $3, qty_on_hand = $4, price = $5 WHERE id = $6 RETURNING *',
      [name, sku, categoryId, qty || 0, price || 0, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};


// GET /api/products/stock
exports.getStockByLocation = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name AS product, w.name AS warehouse, w.location, 
             COALESCE(ps.qty, 0) AS on_hand, 0 AS reserved, COALESCE(ps.qty, 0) AS available
      FROM products p
      CROSS JOIN warehouses w
      LEFT JOIN product_stock ps ON ps.product_id = p.id AND ps.warehouse_id = w.id
      ORDER BY p.name ASC, w.name ASC
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
