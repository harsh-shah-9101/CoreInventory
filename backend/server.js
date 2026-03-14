const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',         require('./src/routes/auth.routes'));
app.use('/api/products',     require('./src/routes/product.routes'));
app.use('/api/receipts',     require('./src/routes/receipt.routes'));
app.use('/api/deliveries',   require('./src/routes/delivery.routes'));
app.use('/api/transfers',    require('./src/routes/transfer.routes'));
app.use('/api/adjustments',  require('./src/routes/adjustment.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));