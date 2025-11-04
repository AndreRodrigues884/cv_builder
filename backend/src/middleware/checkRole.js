export const authorizeRoles = () => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }
    next();
  };
};
