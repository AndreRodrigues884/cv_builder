import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import router from './routes/index.js';

dotenv.config();

const app = express();
app.use(helmet());

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', router);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api`);
});