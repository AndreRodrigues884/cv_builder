import { Router } from 'express';
import * as aiController from '../controllers/ai.controllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/generate-summary', authenticateToken, aiController.generateSummary); //Feito
router.post('/improve-text', authenticateToken, aiController.improveText);
router.post('/suggest-skills', authenticateToken, aiController.suggestSkills);//Feito
router.post('/optimize-ats', authenticateToken, aiController.optimizeForATS);//Feito por agora
router.post('/review-cv', authenticateToken, aiController.reviewCV);//Feito
router.post('/interview-questions', authenticateToken, aiController.generateInterviewQuestions);//Feito
router.post('/suggest-career-path', authenticateToken, aiController.suggestCareerPath);//Feito
router.post('/improve-experience', authenticateToken, aiController.improveExperience);


export default router;