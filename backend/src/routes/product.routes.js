const router = require('express').Router();
const productController = require('../controllers/product.controller');

router.get('/',               productController.getProducts);
router.post('/',              productController.createProduct);
router.get('/stock',          productController.getStockByLocation);
router.get('/reorder-rules',  productController.getReorderRules);

module.exports = router;
