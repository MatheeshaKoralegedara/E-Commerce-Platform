const express = require('express');
const { register, login, forgotPassword, resetPassword, updateProfile } = require('../controllers/authController')
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/profile', requireAuth, updateProfile);

module.exports = router;