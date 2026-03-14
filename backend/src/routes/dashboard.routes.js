const router = require('express').Router();
const { getStats } = require('../controllers/dashboard.controller');

router.get('/stats', getStats);

module.exports = router;
