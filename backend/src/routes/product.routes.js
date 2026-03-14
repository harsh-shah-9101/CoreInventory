const router = require('express').Router();
const productController = require('../controllers/product.controller');

router.get('/',               productController.getProducts);
router.post('/',              productController.createProduct);
router.put('/:id',            productController.updateProduct);
router.put('/:id/stock',      productController.updateStock);
router.get('/stock',          productController.getStockByLocation);
router.get('/reorder-rules',  productController.getReorderRules);
router.post('/reorder-rules', productController.createReorderRule);

module.exports = router;
