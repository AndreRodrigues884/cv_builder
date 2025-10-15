// src/helpers/tokens.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateTokens(userId) {
  const refreshTokenExpiresDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS);

  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${refreshTokenExpiresDays}d` }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresDays);

  // Armazena refresh token no banco
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
