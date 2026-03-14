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

// PUT /api/products/:id/stock
exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { qty_on_hand } = req.body;
  if (qty_on_hand === undefined) return res.status(400).json({ error: 'qty_on_hand is required' });

  try {
    const result = await pool.query(
      'UPDATE products SET qty_on_hand = $1 WHERE id = $2 RETURNING *',
      [qty_on_hand, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
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
      SELECT p.name AS product, r.min_qty, r.max_qty, r.reorder_qty, 
             COALESCE((SELECT SUM(qty) FROM product_stock WHERE product_id = p.id), p.qty_on_hand) AS current_qty
      FROM reorder_rules r
      JOIN products p ON p.id = r.product_id
    `);
    res.json({ rules: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reorder rules' });
  }
};

// POST /api/products/reorder-rules
exports.createReorderRule = async (req, res) => {
  const { product, min_qty, max_qty, reorder_qty } = req.body;
  try {
    const prodRes = await pool.query('SELECT id FROM products WHERE name = $1 OR sku = $1', [product]);
    if (!prodRes.rows.length) return res.status(404).json({ error: 'Product not found' });
    const productId = prodRes.rows[0].id;

    const result = await pool.query(`
      INSERT INTO reorder_rules (product_id, min_qty, max_qty, reorder_qty)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (product_id) DO UPDATE 
      SET min_qty = EXCLUDED.min_qty, max_qty = EXCLUDED.max_qty, reorder_qty = EXCLUDED.reorder_qty
      RETURNING *
    `, [productId, min_qty || 0, max_qty || 0, reorder_qty || 0]);
    res.status(21).json({ rule: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create reorder rule' });
  }
};
