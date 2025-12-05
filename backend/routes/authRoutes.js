const express = require('express');
const { 
  signup, 
  login, 
  verifyEmail, 
  getMe, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', verifyEmail);
router.get('/me', protect, getMe);

// 🟢 These are the ones causing the error if missing
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;