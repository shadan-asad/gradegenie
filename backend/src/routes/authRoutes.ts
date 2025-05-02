import express from 'express';
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
  microsoftAuth,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/microsoft', microsoftAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);

export default router; 