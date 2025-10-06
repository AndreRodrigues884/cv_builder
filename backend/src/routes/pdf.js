const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/:id/download', pdfController.generatePDF);

module.exports = router;