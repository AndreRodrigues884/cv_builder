// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {authLimiter}  = require('../middleware/rateLimiter');

router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);

module.exports = router;