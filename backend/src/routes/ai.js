const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');
const {aiLimiter}  = require('../middleware/rateLimiter');

router.use(authMiddleware);
router.use(aiLimiter)

router.post('/improve-description', aiController.improveDescription);
router.post('/suggest-skills', aiController.suggestSkills);
router.post('/generate-summary', aiController.generateSummary);
router.post('/optimize-ats', aiController.optimizeForATS);

module.exports = router;