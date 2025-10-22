// src/controllers/template.controller.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();


/**
 * Listar todos os templates
 * GET /api/templates
 */
export const getAll = async (req, res) => {
  try {
    const { type, isPremium, isActive = 'true' } = req.query;

    // Construir filtros
    const where = {};

    if (type) {
      where.type = type;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.template.findMany({
      where: where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Separar por categoria
    const categorized = {
      free: templates.filter(t => !t.isPremium),
      premium: templates.filter(t => t.isPremium),
      byType: {},
    };

    // Agrupar por tipo
    templates.forEach(template => {
      const type = template.type;
      if (!categorized.byType[type]) {
        categorized.byType[type] = [];
      }
      categorized.byType[type].push(template);
    });

    return res.status(200).json({
      success: true,
      data: {
        templates: templates,
        categorized: categorized,
        total: templates.length,
        free: categorized.free.length,
        premium: categorized.premium.length,
      },
    });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar templates',
    });
  }
}

/**
 * Obter template por ID
 * GET /api/templates/:id
 */

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id: id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Contar quantos CVs usam este template
    const usageCount = await prisma.cV.count({
      where: { templateId: id },
    });

    return res.status(200).json({
      success: true,
      data: {
        template: {
          ...template,
          usageCount: usageCount,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar template',
    });
  }
}

/**
 * Obter template por slug
 * GET /api/templates/slug/:slug
 */

export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const template = await prisma.template.findUnique({
      where: { slug: slug },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: { template },
    });
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar template',
    });
  }
}

/**
 * Listar templates gratuitos
 * GET /api/templates/free
 */

export const getFreeTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        isPremium: false,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        templates: templates,
        count: templates.length,
      },
    });
  } catch (error) {
    console.error('Erro ao listar templates gratuitos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar templates gratuitos',
    });
  }
}

/**
 * Listar templates premium
 * GET /api/templates/premium
 */

export const getPremiumTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        isPremium: true,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        templates: templates,
        count: templates.length,
      },
    });
  } catch (error) {
    console.error('Erro ao listar templates premium:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar templates premium',
    });
  }
}

/**
 * Listar templates por tipo
 * GET /api/templates/type/:type
 */

export const getByType = async (req, res) => {
  try {
    const { type } = req.params;

    // Validar tipo
    const validTypes = ['MODERN', 'CLASSIC', 'CREATIVE', 'MINIMAL', 'EXECUTIVE', 'TECHNICAL'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de template inválido',
        validTypes: validTypes,
      });
    }

    const templates = await prisma.template.findMany({
      where: {
        type: type.toUpperCase(),
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        templates: templates,
        type: type.toUpperCase(),
        count: templates.length,
      },
    });
  } catch (error) {
    console.error('Erro ao listar templates por tipo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar templates',
    });
  }
}

/**
 * Recomendar template baseado na área profissional
 * GET /api/templates/recommend/:jobArea
 */

export const recommendTemplate = async (req, res) => {
  try {
    const { jobArea } = req.params;
    const userId = req.user?.id;

    // Mapeamento de áreas para tipos de template
    const areaToTemplateType = {
      'tecnologia': 'TECHNICAL',
      'tech': 'TECHNICAL',
      'ti': 'TECHNICAL',
      'design': 'CREATIVE',
      'criativo': 'CREATIVE',
      'arte': 'CREATIVE',
      'marketing': 'MODERN',
      'vendas': 'MODERN',
      'gestao': 'EXECUTIVE',
      'administracao': 'EXECUTIVE',
      'executivo': 'EXECUTIVE',
      'financas': 'CLASSIC',
      'contabilidade': 'CLASSIC',
      'direito': 'CLASSIC',
    };

    const recommendedType = areaToTemplateType[jobArea.toLowerCase()] || 'MODERN';

    // Buscar templates do tipo recomendado
    let templates = await prisma.template.findMany({
      where: {
        type: recommendedType,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Se user estiver autenticado, verificar plano
    if (userId) {
      const billing = await prisma.billing.findUnique({
        where: { userId: userId },
      });

      // Se for free, filtrar apenas templates gratuitos
      if (billing && billing.plan === 'FREE') {
        templates = templates.filter(t => !t.isPremium);
      }
    }

    // Se não houver templates, retornar todos ativos
    if (templates.length === 0) {
      templates = await prisma.template.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 5,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        jobArea: jobArea,
        recommendedType: recommendedType,
        templates: templates,
        reason: `Templates ${recommendedType} são ideais para ${jobArea}`,
      },
    });
  } catch (error) {
    console.error('Erro ao recomendar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao recomendar template',
    });
  }
}

/**
 * Criar novo template (Admin)
 * POST /api/templates
 */

export const createTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      slug,
      type,
      description,
      previewUrl,
      isPremium,
      metadata,
      sortOrder,
    } = req.body;

    // Verificar se slug já existe
    const existingSlug = await prisma.template.findUnique({
      where: { slug: slug },
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: 'Slug já está em uso',
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        slug,
        type,
        description,
        previewUrl,
        isPremium: isPremium || false,
        metadata: metadata || {},
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      data: { template },
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar template',
    });
  }
}

/**
 * Atualizar template (Admin)
 * PUT /api/templates/:id
 */

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      type,
      description,
      previewUrl,
      isPremium,
      metadata,
      sortOrder,
      isActive,
    } = req.body;

    // Verificar se template existe
    const existingTemplate = await prisma.template.findUnique({
      where: { id: id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Se slug mudou, verificar se novo slug já existe
    if (slug && slug !== existingTemplate.slug) {
      const slugExists = await prisma.template.findUnique({
        where: { slug: slug },
      });

      if (slugExists) {
        return res.status(409).json({
          success: false,
          message: 'Slug já está em uso',
        });
      }
    }

    // Construir objeto de atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (previewUrl !== undefined) updateData.previewUrl = previewUrl;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.template.update({
      where: { id: id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: { template },
    });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar template',
    });
  }
}

/**
 * Apagar template (Admin)
 * DELETE /api/templates/:id
 */

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se template existe
    const template = await prisma.template.findUnique({
      where: { id: id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Verificar se há CVs usando este template
    const cvsUsingTemplate = await prisma.cV.count({
      where: { templateId: id },
    });

    if (cvsUsingTemplate > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível apagar. ${cvsUsingTemplate} CV(s) estão usando este template`,
        cvsCount: cvsUsingTemplate,
      });
    }

    await prisma.template.delete({
      where: { id: id },
    });

    return res.status(200).json({
      success: true,
      message: 'Template apagado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar template',
    });
  }
}

/**
 * Ativar/Desativar template (Admin)
 * PUT /api/templates/:id/toggle
 */

export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id: id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    const updatedTemplate = await prisma.template.update({
      where: { id: id },
      data: {
        isActive: !template.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Template ${updatedTemplate.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: { template: updatedTemplate },
    });
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao alternar status do template',
    });
  }
}

/**
 * Obter estatísticas de uso dos templates (Admin)
 * GET /api/templates/stats/usage
 */

export const getUsageStats = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
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
    });

    const stats = templates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      isPremium: template.isPremium,
      isActive: template.isActive,
      usageCount: template._count.cvs,
    }));

    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const totalUsage = stats.reduce((sum, t) => sum + t.usageCount, 0);
    const mostUsed = stats[0] || null;

    return res.status(200).json({
      success: true,
      data: {
        stats: stats,
        summary: {
          totalTemplates,
          activeTemplates,
          totalUsage,
          mostUsed: mostUsed ? {
            name: mostUsed.name,
            count: mostUsed.usageCount,
          } : null,
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