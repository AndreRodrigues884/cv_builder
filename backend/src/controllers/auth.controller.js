import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '../helpers/tokens.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email e senha são obrigatórios." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: "Utilizador já existe." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role
      },
    });

    // Billing
    await prisma.billing.create({
      data: {
        userId: user.id,
        plan: "PRO",
        subscriptionStatus: "ACTIVE",
        cvGenerationLimit: 50,
        cvGenerationCount: 0,
        lastResetAt: new Date(),
      },
    });

    // Profile
    await prisma.profile.create({
      data: {
        userId: user.id,
        headline: "",
        summary: "",
        location: "",
        visibility: "PRIVATE"
      }
    });

    // Tokens
    const tokens = await generateTokens(user.id, user.role);

    res.status(201).json({
      message: "Utilizador registado com sucesso.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    });

  } catch (err) {
    console.error("Erro no register:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword)
      return res.status(401).json({ error: 'Dados inválidos.' });

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid)
      return res.status(401).json({ error: 'Dados inválidos.' });

    // Atualiza o último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await generateTokens(user.id, user.role);

    res.json({
      message: 'Login efetuado com sucesso.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: 'Refresh token ausente.' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored)
      return res.status(401).json({ error: 'Refresh token inválido.' });

    // Verifica validade
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (new Date(stored.expiresAt) < new Date())
      return res.status(401).json({ error: 'Refresh token expirado.' });

    // Remove o token antigo (rotativo)
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    // Gera novo par de tokens
    const tokens = await generateTokens(decoded.userId);

    res.json({
      message: 'Tokens renovados com sucesso.',
      ...tokens,
    });
  } catch (err) {
    console.error('Erro no refresh:', err);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: 'Logout realizado com sucesso.' });
  } catch (err) {
    console.error('Erro no logout:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


export const googleOAuth = (req, res) => {
  const scope = encodeURIComponent('openid email profile');
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
    `&client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&scope=${scope}`;

  res.redirect(authUrl);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'Código OAuth não fornecido' });

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    const { id_token } = tokenResponse.data;
    const userInfo = jwt.decode(id_token);

    if (!userInfo?.email) throw new Error('Não foi possível obter email do usuário');

    let user = await prisma.user.findUnique({ where: { email: userInfo.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          oauthProvider: 'GOOGLE',
          oauthId: userInfo.sub,
          emailVerified: true
        }
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id);

    // 🔁 Redireciona para o frontend
    const redirectUrl = `http://localhost:3000/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }))}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Erro OAuth Google:', err.message);
    res.status(500).json({ error: 'Erro ao autenticar com Google' });
  }
};

