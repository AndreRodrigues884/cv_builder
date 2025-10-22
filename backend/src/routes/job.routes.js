import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as jobController from '../controllers/job.controllers.js';

const router = Router();

router.post('/import', authenticateToken, jobController.importJob);
router.post('/match-cv', authenticateToken, jobController.matchCVToJob);
router.post('/analyze-match', authenticateToken, jobController.analyzeMatch);
router.get('/my-imports', authenticateToken, jobController.getMyJobImports);
router.delete('/:id', authenticateToken, jobController.deleteJobImport);

export default router;