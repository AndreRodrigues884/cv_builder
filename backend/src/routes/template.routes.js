
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js'
import { body, param  } from 'express-validator';
import * as templateController from '../controllers/template.controllers.js';

const router = Router();

/**
 * @route   GET /api/templates
 * @desc    Listar todos os templates (com filtros opcionais)
 * @access  Public
 * @query   ?type=MODERN&isPremium=true&isActive=true
 */
router.get('/', templateController.getAll);

/**
 * @route   GET /api/templates/free
 * @desc    Listar templates gratuitos
 * @access  Public
 */
router.get('/free', templateController.getFreeTemplates);

/**
 * @route   GET /api/templates/premium
 * @desc    Listar templates premium
 * @access  Public
 */
router.get('/premium', templateController.getPremiumTemplates);

/**
 * @route   GET /api/templates/stats/usage
 * @desc    Estatísticas de uso dos templates (Admin)
 * @access  Private (Admin)
 */
router.get('/stats/usage', authenticateToken, authorizeRoles('ADMIN'), templateController.getUsageStats);

/**
 * @route   GET /api/templates/type/:type
 * @desc    Listar templates por tipo (MODERN, CLASSIC, etc)
 * @access  Public
 */
router.get(
  '/type/:type',
  [param('type').notEmpty().withMessage('Tipo é obrigatório')],
  templateController.getByType
);

/**
 * @route   GET /api/templates/recommend/:jobArea
 * @desc    Recomendar template baseado na área profissional
 * @access  Public (melhor com auth)
 */
router.get(
  '/recommend/:jobArea',
  [param('jobArea').notEmpty().withMessage('Área profissional é obrigatória')],
  templateController.recommendTemplate
);

/**
 * @route   GET /api/templates/slug/:slug
 * @desc    Obter template por slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  [param('slug').notEmpty().withMessage('Slug é obrigatório')],
  templateController.getBySlug
);

/**
 * @route   GET /api/templates/:id
 * @desc    Obter template por ID
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('ID é obrigatório')],
  templateController.getById
);

/**
 * @route   POST /api/templates
 * @desc    Criar novo template (Admin)
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug é obrigatório')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
    body('type')
      .isIn(['MODERN', 'CLASSIC', 'CREATIVE', 'MINIMAL', 'EXECUTIVE', 'TECHNICAL'])
      .withMessage('Tipo inválido'),
    body('description').optional().trim(),
    body('previewUrl').isURL().withMessage('URL de preview inválida'),
    body('isPremium').optional().isBoolean(),
    body('metadata').optional().isObject(),
    body('sortOrder').optional().isInt(),
  ],
  templateController.createTemplate
);

/**
 * @route   PUT /api/templates/:id
 * @desc    Editar template (Admin)
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  [
    param('id').notEmpty().withMessage('ID é obrigatório'),
    body('name').optional().trim().notEmpty(),
    body('slug')
      .optional()
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
    body('type')
      .optional()
      .isIn(['MODERN', 'CLASSIC', 'CREATIVE', 'MINIMAL', 'EXECUTIVE', 'TECHNICAL'])
      .withMessage('Tipo inválido'),
    body('description').optional().trim(),
    body('previewUrl').optional().isURL(),
    body('isPremium').optional().isBoolean(),
    body('metadata').optional().isObject(),
    body('sortOrder').optional().isInt(),
    body('isActive').optional().isBoolean(),
  ],
  templateController.updateTemplate
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Apagar template (Admin)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  [param('id').notEmpty().withMessage('ID é obrigatório')],
  templateController.deleteTemplate
);

/**
 * @route   PUT /api/templates/:id/toggle
 * @desc    Ativar/Desativar template (Admin)
 * @access  Private (Admin)
 */
router.put(
  '/:id/toggle',
  authenticateToken,
  authorizeRoles('ADMIN'),
  [param('id').notEmpty().withMessage('ID é obrigatório')],
  templateController.toggleActive
);

export default router;