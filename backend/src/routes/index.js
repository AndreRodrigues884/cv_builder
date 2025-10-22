import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import profileRoutes from './profile.routes.js';
import cvRoutes from './cv.routes.js';
/* import templateRoutes from './template.routes.js'; */
import aiRoutes from './ai.routes.js';
import jobRoutes from './job.routes.js';
import billingRoutes from './billing.routes.js';
import adminRoutes from './admin.routes.js';
/* import storageRoutes from './storage.routes.js'; */

const router = Router();
router.use(apiLimiter);

// ✅ Health check (para monitorização e DevOps)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CV Builder API',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ✅ Montar rotas principais da API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/cv', cvRoutes);
/* router.use('/templates', templateRoutes); */
router.use('/ai', aiRoutes);
router.use('/jobs', jobRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);
/* router.use('/storage', storageRoutes) */

// ✅ Fallback route (404 handler para endpoints desconhecidos)
router.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

export default router;