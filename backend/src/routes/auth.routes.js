import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/google', authController.googleOAuth);
router.get('/google/callback', authController.googleCallback);


export default router;
