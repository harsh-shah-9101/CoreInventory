const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

app.use('/api/auth',        require('./src/routes/auth.routes'));
app.use('/api/products',    require('./src/routes/product.routes'));
app.use('/api/categories',  require('./src/routes/category.routes'));
app.use('/api/warehouses',  require('./src/routes/warehouse.routes'));
app.use('/api/locations',   require('./src/routes/location.routes'));
app.use('/api/receipts',    require('./src/routes/receipt.routes'));
app.use('/api/deliveries',  require('./src/routes/delivery.routes'));
app.use('/api/transfers',   require('./src/routes/transfer.routes'));
app.use('/api/adjustments', require('./src/routes/adjustment.routes'));
app.use('/api/dashboard',   require('./src/routes/dashboard.routes'));
app.use('/api/operations',  require('./src/routes/operations.routes'));
app.use('/api/ledger',      require('./src/routes/ledger.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));