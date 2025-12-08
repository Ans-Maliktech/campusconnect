const express = require('express');
const { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getMe,
  resendVerificationCode,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-code', resendVerificationCode);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
module.exports = router;