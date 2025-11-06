
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js'
import * as templateController from '../controllers/template.controllers.js';

const router = Router();

router.get('/', templateController.getAll);
router.get('/slug/:slug', templateController.getBySlug);
router.get('/recommend/:jobArea', templateController.recommendTemplate);
router.get('/:id', templateController.getById);

// Rotas de Admin
router.post('/upload-design', authenticateToken, authorizeRoles('ADMIN'), templateController.uploadTemplateDesign);
router.post('/create-from-design', authenticateToken, authorizeRoles('ADMIN'), templateController.createTemplateFromDesign);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), templateController.updateTemplate);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), templateController.deleteTemplate);
router.put('/:id/toggle', authenticateToken, authorizeRoles('ADMIN'), templateController.toggleActive);
router.get('/stats/usage', authenticateToken, authorizeRoles('ADMIN'), templateController.getUsageStats);

export default router;