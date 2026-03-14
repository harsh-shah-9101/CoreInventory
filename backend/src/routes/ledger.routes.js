const router = require('express').Router();
const { getLedgerEntries } = require('../controllers/ledger.controller');

router.get('/', getLedgerEntries);

module.exports = router;
