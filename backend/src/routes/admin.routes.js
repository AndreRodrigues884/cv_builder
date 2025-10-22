//Rotas de usuário (/users, /users/:id).
import { Router } from 'express';
import { body, param, query  } from 'express-validator';
import * as adminController from '../controllers/admin.controllers.js';

const router = Router();

router.post(
  '/init-admin',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
    body('name').notEmpty().withMessage('O nome é obrigatório.'),
  ],
  adminController.initializeFirstAdmin
);

export default router; 