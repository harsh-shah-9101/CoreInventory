const router = require('express').Router();
const { createDelivery, getDeliveries } = require('../controllers/delivery.controller');

router.get('/', getDeliveries);
router.post('/', createDelivery);

module.exports = router;
