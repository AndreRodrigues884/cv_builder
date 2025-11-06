// src/controllers/template.controller.js - ATUALIZADO
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import sharp from 'sharp';
import storageService from '../services/storage.services.js';
import aiService from '../services/ai.services.js';

const prisma = new PrismaClient();

// Configurar Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG/PNG são permitidas'));
    }
  },
});

/**
 * Upload de imagem do template e análise com IA
 * POST /api/templates/upload-design
 */
export const uploadTemplateDesign = [
  upload.single('designImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada',
        });
      }

      const { templateName, slug } = req.body;

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Slug do template é obrigatório',
        });
      }

      console.log('📤 Upload de design do template recebido:', slug);

      // Otimizar imagem com Sharp
      const optimizedBuffer = await sharp(req.file.buffer)
        .resize(1200, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 90 })
        .toBuffer();

      // Upload para Cloudinary
      const uploadResult = await storageService.uploadTemplateImage(
        optimizedBuffer,
        slug
      );

      console.log('✅ Imagem uploaded:', uploadResult.preview.url);

      // Download da imagem original para análise local
      const localImagePath = await storageService.downloadTemplateImage(
        uploadResult.original.publicId
      );

      // Analisar layout com IA
      console.log('🔍 Analisando layout do template...');
      const layoutAnalysis = await aiService.analyzeTemplateLayout(localImagePath);
      

      // Gerar HTML/CSS baseado no layout
      console.log('🎨 Gerando código do template...');
      const { html, css } = await aiService.generateTemplateCode(layoutAnalysis);

      return res.status(200).json({
        success: true,
        message: 'Design carregado e analisado com sucesso',
        data: {
          images: uploadResult,
          layoutAnalysis,
          generatedCode: {
            html,
            css,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload: ' + error.message,
      });
    }
  },
];

/**
 * Criar template a partir do design
 * POST /api/templates/create-from-design
 */
export const createTemplateFromDesign = async (req, res) => {
  try {
    const {
      name,
      slug,
      type,
      description,
      previewImageUrl,
      originalImageUrl,
      layoutData,
      generatedHTML,
      generatedCSS,
      isPremium,
    } = req.body;

    // Verificar se slug já existe
    const existingSlug = await prisma.template.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: 'Slug já está em uso',
      });
    }

    console.log('🎨 Criando template a partir do design:', slug);

    // Criar template na BD
    const template = await prisma.template.create({
      data: {
        name,
        slug,
        type: type || 'MODERN',
        description,
        previewImageUrl, // URL da preview do Cloudinary
        layoutData, // Dados da análise de layout
        generatedHTML, // HTML gerado pela IA
        generatedCSS, // CSS gerado pela IA
        isPremium: isPremium || false,
        isActive: true,
        sortOrder: 0,
        metadata: {
          originalImageUrl, // URL da imagem original
          generatedBy: 'ai',
          generatedAt: new Date().toISOString(),
        },
      },
    });

    console.log('✅ Template criado:', template.id);

    return res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      data: { template },
    });
  } catch (error) {
    console.error('❌ Erro ao criar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar template: ' + error.message,
    });
  }
};

/**
 * Listar todos os templates
 * GET /api/templates
 */
export const getAll = async (req, res) => {
  try {
    const { type, isPremium, isActive = 'true' } = req.query;

    const where = {};

    if (type) where.type = type;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        previewImageUrl: true, // Incluir URL da preview
        isPremium: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        _count: {
          select: { cvs: true },
        },
      },
    });

    // Separar por categoria
    const categorized = {
      free: templates.filter(t => !t.isPremium),
      premium: templates.filter(t => t.isPremium),
      byType: {},
    };

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
        templates,
        categorized,
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
};

/**
 * Obter template por ID (com HTML/CSS)
 * GET /api/templates/:id
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cvs: true },
        },
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        template: {
          ...template,
          usageCount: template._count.cvs,
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
};

/**
 * Obter template por slug
 * GET /api/templates/slug/:slug
 */
export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const template = await prisma.template.findUnique({
      where: { slug },
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
};

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
      previewImageUrl,
      isPremium,
      metadata,
      sortOrder,
      isActive,
      generatedHTML,
      generatedCSS,
      layoutData,
    } = req.body;

    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Verificar slug
    if (slug && slug !== existingTemplate.slug) {
      const slugExists = await prisma.template.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(409).json({
          success: false,
          message: 'Slug já está em uso',
        });
      }
    }

    // Construir update
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (previewImageUrl !== undefined) updateData.previewImageUrl = previewImageUrl;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (generatedHTML !== undefined) updateData.generatedHTML = generatedHTML;
    if (generatedCSS !== undefined) updateData.generatedCSS = generatedCSS;
    if (layoutData !== undefined) updateData.layoutData = layoutData;

    const template = await prisma.template.update({
      where: { id },
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
};

/**
 * Apagar template (Admin)
 * DELETE /api/templates/:id
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Verificar CVs usando template
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

    // Apagar imagens do Cloudinary
    if (template.slug) {
      await storageService.deleteTemplateImages(template.slug);
    }

    await prisma.template.delete({
      where: { id },
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
};

/**
 * Recomendar template baseado na área profissional
 * GET /api/templates/recommend/:jobArea
 */
export const recommendTemplate = async (req, res) => {
  try {
    const { jobArea } = req.params;
    const userId = req.user?.id;

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

    let templates = await prisma.template.findMany({
      where: {
        type: recommendedType,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Filtrar por plano do user
    if (userId) {
      const billing = await prisma.billing.findUnique({
        where: { userId },
      });

      if (billing?.plan === 'FREE') {
        templates = templates.filter(t => !t.isPremium);
      }
    }

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
        jobArea,
        recommendedType,
        templates,
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
};

/**
 * Toggle ativo/inativo
 * PUT /api/templates/:id/toggle
 */
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: { isActive: !template.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Template ${updatedTemplate.isActive ? 'ativado' : 'desativado'}`,
      data: { template: updatedTemplate },
    });
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao alternar status',
    });
  }
};

/**
 * Estatísticas de uso
 * GET /api/templates/stats/usage
 */
export const getUsageStats = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      include: {
        _count: { select: { cvs: true } },
      },
      orderBy: {
        cvs: { _count: 'desc' },
      },
    });

    const stats = templates.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      isPremium: t.isPremium,
      isActive: t.isActive,
      usageCount: t._count.cvs,
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats,
        summary: {
          totalTemplates: templates.length,
          activeTemplates: templates.filter(t => t.isActive).length,
          totalUsage: stats.reduce((sum, t) => sum + t.usageCount, 0),
          mostUsed: stats[0] || null,
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
};