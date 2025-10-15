import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as authController from '../controllers/user.controllers.js';

const router = Router();

router.get('/me', authenticateToken, authController.me);

export default router;
