import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validation.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validators.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes
router.use(authenticate);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);
router.put('/profile', validateRequest(updateProfileSchema), AuthController.updateProfile);
router.put('/change-password', validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;