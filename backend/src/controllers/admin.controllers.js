// src/controllers/admin.controller.js
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


/**
 * Dashboard - Overview geral da plataforma
 * GET /api/admin/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // Estatísticas gerais
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        isActive: true,
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
        },
      },
    });

    const totalCVs = await prisma.cV.count();
    const cvsThisMonth = await prisma.cV.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalReviews = await prisma.aIReview.count();
    const reviewsThisMonth = await prisma.aIReview.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Distribuição de planos
    const planDistribution = await prisma.billing.groupBy({
      by: ['plan'],
      _count: true,
    });

    // Receita estimada (considerando valores dos planos)
    const planValues = {
      FREE: 0,
      PRO: 10,
      CAREER_PLUS: 25,
      BUSINESS: 50,
    };

    const estimatedMRR = planDistribution.reduce((sum, item) => {
      return sum + (planValues[item.plan] || 0) * item._count;
    }, 0);

    // Templates mais usados
    const topTemplates = await prisma.template.findMany({
      include: {
        _count: {
          select: { cvs: true },
        },
      },
      orderBy: {
        cvs: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Usuários mais ativos
    const topUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: { cvs: true },
        },
        billing: {
          select: { plan: true },
        },
      },
      orderBy: {
        cvs: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Crescimento mensal (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalCVs,
          cvsThisMonth,
          totalReviews,
          reviewsThisMonth,
          estimatedMRR: `€${estimatedMRR}`,
        },
        planDistribution: planDistribution.map(item => ({
          plan: item.plan,
          count: item._count,
          percentage: ((item._count / totalUsers) * 100).toFixed(1),
        })),
        topTemplates: topTemplates.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          usageCount: t._count.cvs,
        })),
        topUsers: topUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          plan: u.billing?.plan || 'FREE',
          cvsCount: u._count.cvs,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter dashboard',
    });
  }
}

/**
 * Listar todos os utilizadores
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive, plan } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Filtro por plano (requer join)
    const billingWhere = plan ? { plan: plan } : undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where,
        include: {
          billing: billingWhere ? { where: billingWhere } : true,
          _count: {
            select: {
              cvs: true,
            },
          },
        },
        skip: skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          emailVerified: u.emailVerified,
          plan: u.billing?.plan || 'FREE',
          cvsCount: u._count.cvs,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar utilizadores',
    });
  }
}

/**
 * Obter detalhes de um utilizador
 * GET /api/admin/users/:id
 */
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        profile: true,
        billing: true,
        cvs: {
          include: {
            template: true,
            aiReviews: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        refreshTokens: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Erro ao obter detalhes do utilizador:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter detalhes',
    });
  }
}

/**
 * Criar utilizador (Admin pode criar qualquer tipo)
 * POST /api/admin/users
 */
export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, name, password, role = 'USER', plan = 'FREE' } = req.body;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está registado',
      });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar utilizador
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role,
        emailVerified: true, // Admin cria já verificado
      },
    });

    // Criar perfil e billing
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    });

    await prisma.billing.create({
      data: {
        userId: user.id,
        plan: plan,
        subscriptionStatus: 'ACTIVE',
        cvGenerationLimit: plan === 'FREE' ? 1 : plan === 'PRO' ? 10 : 999,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar utilizador',
    });
  }
}

/**
 * Atualizar role de utilizador
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'HR_MANAGER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role inválida',
      });
    }

    const user = await prisma.user.update({
      where: { id: id },
      data: { role: role },
    });

    return res.status(200).json({
      success: true,
      message: 'Role atualizada com sucesso',
      data: { user },
    });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar role',
    });
  }
}

/**
 * Ativar/Desativar utilizador
 * PUT /api/admin/users/:id/status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado',
      });
    }

    // Não permitir desativar a própria conta
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não podes desativar a tua própria conta',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        isActive: !user.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Utilizador ${updatedUser.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao alterar status',
    });
  }
}

/**
 * Apagar utilizador (soft delete - desativa)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.body;

    // Não permitir apagar a própria conta
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não podes apagar a tua própria conta',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado',
      });
    }

    if (permanent) {
      // Delete permanente (cuidado!)
      await prisma.user.delete({
        where: { id: id },
      });

      return res.status(200).json({
        success: true,
        message: 'Utilizador apagado permanentemente',
      });
    } else {
      // Soft delete - apenas desativa
      await prisma.user.update({
        where: { id: id },
        data: { isActive: false },
      });

      return res.status(200).json({
        success: true,
        message: 'Utilizador desativado',
      });
    }
  } catch (error) {
    console.error('Erro ao apagar utilizador:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar utilizador',
    });
  }
}

/**
 * Atualizar plano de utilizador
 * PUT /api/admin/users/:id/plan
 */
export const updateUserPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!['FREE', 'PRO', 'CAREER_PLUS', 'BUSINESS'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Plano inválido',
      });
    }

    const limits = {
      FREE: 1,
      PRO: 10,
      CAREER_PLUS: 999,
      BUSINESS: 999,
    };

    const billing = await prisma.billing.update({
      where: { userId: id },
      data: {
        plan: plan,
        cvGenerationLimit: limits[plan],
        subscriptionStatus: 'ACTIVE',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: { billing },
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano',
    });
  }
}

/**
 * Estatísticas de CVs
 * GET /api/admin/stats/cvs
 */
export const getCVStats = async (req, res) => {
  try {
    const totalCVs = await prisma.cV.count();

    const byStatus = await prisma.cV.groupBy({
      by: ['status'],
      _count: true,
    });

    const byLanguage = await prisma.cV.groupBy({
      by: ['language'],
      _count: true,
    });

    const byTemplate = await prisma.template.findMany({
      include: {
        _count: {
          select: { cvs: true },
        },
      },
    });

    const averageReviewScore = await prisma.aIReview.aggregate({
      _avg: {
        scoreOverall: true,
        scoreAts: true,
        scoreLanguage: true,
        scoreImpact: true,
        scoreClarity: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        total: totalCVs,
        byStatus,
        byLanguage,
        byTemplate: byTemplate.map(t => ({
          name: t.name,
          count: t._count.cvs,
        })),
        averageScores: {
          overall: averageReviewScore._avg.scoreOverall?.toFixed(1) || 0,
          ats: averageReviewScore._avg.scoreAts?.toFixed(1) || 0,
          language: averageReviewScore._avg.scoreLanguage?.toFixed(1) || 0,
          impact: averageReviewScore._avg.scoreImpact?.toFixed(1) || 0,
          clarity: averageReviewScore._avg.scoreClarity?.toFixed(1) || 0,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
    });
  }
}

/**
 * Listar todas as reviews (para auditoria)
 * GET /api/admin/reviews
 */
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.aIReview.findMany({
        include: {
          cv: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip: skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aIReview.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar reviews',
    });
  }
}

/**
 * Logs de sistema (últimas ações)
 * GET /api/admin/logs
 */
export const getSystemLogs = async (req, res) => {
  try {
    // Buscar últimas ações relevantes
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const recentCVs = await prisma.cV.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const recentReviews = await prisma.aIReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        cv: {
          select: {
            title: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        recentUsers,
        recentCVs,
        recentReviews,
      },
    });
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter logs',
    });
  }
}

export const initializeFirstAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Verificar se já existe algum utilizador com role ADMIN
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return res.status(403).json({
        error: 'Já existe um administrador. Esta rota só pode ser usada uma vez.',
      });
    }

    // Verificar se o email já existe (só por precaução)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Este email já está em uso.' });
    }

    // Criar o utilizador ADMIN
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: 'ADMIN',
      },
    });

    res.status(201).json({
      message: 'Administrador inicial criado com sucesso!',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error('Erro ao criar o primeiro admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


