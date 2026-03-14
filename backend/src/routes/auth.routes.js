const router = require('express').Router();
const { signup, login, logout, sendOtp, resetPassword } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

module.exports = router;