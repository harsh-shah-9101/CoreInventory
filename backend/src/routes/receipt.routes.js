const router = require('express').Router();
const { createReceipt, getReceipts, validateReceipt } = require('../controllers/receipt.controller');

router.get('/', getReceipts);
router.post('/', createReceipt);
router.post('/:id/validate', validateReceipt);

module.exports = router;
