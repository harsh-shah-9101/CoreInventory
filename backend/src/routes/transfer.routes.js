const router = require('express').Router();
const { createTransfer, getTransfers, validateTransfer } = require('../controllers/transfer.controller');

router.get('/', getTransfers);
router.post('/', createTransfer);
router.post('/:id/validate', validateTransfer);

module.exports = router;
