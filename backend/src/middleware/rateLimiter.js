const rateLimit = require('express-rate-limit');

// Limitar requests da API OpenAI (caro!)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests
  message: 'Muitas solicitações de IA. Tenta novamente em 15 minutos.',
});

// Limitar login (segurança)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tenta novamente em 15 minutos.',
});

module.exports = { aiLimiter, authLimiter };