import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      console.error('Erro na verificação do token:', err);
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }

    req.user = user; // coloca o userId decodificado no req
    next();
  });
};

