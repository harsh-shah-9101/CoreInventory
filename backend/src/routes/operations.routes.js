const router = require('express').Router();
const { updateStatus, getHistory } = require('../controllers/operations.controller');

// GET /api/operations/history
router.get('/history', getHistory);

// PATCH /api/operations/:type/:id/status
// type = receipts | deliveries | transfers | adjustments
router.patch('/:type/:id/status', updateStatus);

module.exports = router;
