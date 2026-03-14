const router = require('express').Router();
const { updateStatus } = require('../controllers/operations.controller');

// PATCH /api/operations/:type/:id/status
// type = receipts | deliveries | transfers | adjustments
router.patch('/:type/:id/status', updateStatus);

module.exports = router;
