import rateLimit from 'express-rate-limit';

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutos
  max: 10,
  message: 'Muitas solicitações de IA. Tenta novamente em 15 minutos.',
});

// Limitar login (segurança)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tenta novamente em 15 minutos.',
});

// Limite global da API
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiados pedidos. Tenta novamente mais tarde.',
  },
});
