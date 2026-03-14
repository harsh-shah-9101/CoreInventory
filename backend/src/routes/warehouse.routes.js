const router = require('express').Router();
const warehouseController = require('../controllers/warehouse.controller');

router.get('/', warehouseController.getWarehouses);
router.post('/', warehouseController.createWarehouse);

module.exports = router;
