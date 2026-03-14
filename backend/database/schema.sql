-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- OTP Tokens
CREATE TABLE IF NOT EXISTS otp_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  otp_code VARCHAR(10) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL
);

-- Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Warehouses / Locations
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  qty_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  warehouse_id INTEGER REFERENCES warehouses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receipts (Incoming Shipments)
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  qty INTEGER NOT NULL,
  warehouse_id INTEGER REFERENCES warehouses(id),
  status VARCHAR(50) DEFAULT 'Draft',
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deliveries (Outgoing Shipments)
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  qty INTEGER NOT NULL,
  warehouse_id INTEGER REFERENCES warehouses(id),
  status VARCHAR(50) DEFAULT 'Draft',
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Internal Transfers
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  qty INTEGER NOT NULL,
  from_warehouse_id INTEGER REFERENCES warehouses(id),
  to_warehouse_id INTEGER REFERENCES warehouses(id),
  status VARCHAR(50) DEFAULT 'Draft',
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Adjustments
CREATE TABLE IF NOT EXISTS adjustments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  qty_change INTEGER NOT NULL,
  warehouse_id INTEGER REFERENCES warehouses(id),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT NOW()
);
