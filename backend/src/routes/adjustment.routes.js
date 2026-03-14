const router = require('express').Router();
const { createAdjustment, getAdjustments, validateAdjustment } = require('../controllers/adjustment.controller');

router.get('/', getAdjustments);
router.post('/', createAdjustment);
router.post('/:id/validate', validateAdjustment);

module.exports = router;
