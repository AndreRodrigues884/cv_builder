import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: 'Token ausente.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userPlan: true,
      },
    });

    if (!user)
      return res.status(404).json({ error: 'Utilizador não encontrado.' });

    // Gerar iniciais
    const userInitials = user.name
      ? user.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      : '';

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        initials: userInitials,
        role: user.role,
        userPlan: user.userPlan,
      },
    });
  } catch (err) {
    console.error('Erro no me:', err);
    res.status(401).json({ error: 'Token inválido.' });
  }
};