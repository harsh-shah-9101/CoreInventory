const router = require('express').Router();
const warehouseController = require('../controllers/warehouse.controller');

router.get('/', warehouseController.getWarehouses);

module.exports = router;
