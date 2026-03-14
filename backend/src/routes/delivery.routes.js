const router = require('express').Router();
const { createDelivery, getDeliveries, validateDelivery } = require('../controllers/delivery.controller');

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.post('/:id/validate', validateDelivery);

module.exports = router;
