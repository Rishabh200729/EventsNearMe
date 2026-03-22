import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes
router.use(authenticate);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);

export default router;