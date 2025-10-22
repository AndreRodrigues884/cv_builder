import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as userController from '../controllers/user.controllers.js';

const router = Router();

export default router;
