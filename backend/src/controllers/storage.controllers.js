// src/controllers/cv.controller.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();


/**
 * Criar novo CV
 * POST /api/cvs
 */
export const createCV = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      title,
      templateId,
      language = 'PT',
      jobTargetTitle,
      jobTargetArea,
      contentJson,
    } = req.body;

    // Verificar limite de CVs do plano
    const billing = await prisma.billing.findUnique({
      where: { userId: userId },
    });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Informações de billing não encontradas',
      });
    }

    // Verificar se precisa resetar contador mensal
    const lastReset = new Date(billing.lastResetAt);
    const now = new Date();
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      await prisma.billing.update({
        where: { userId: userId },
        data: {
          cvGenerationCount: 0,
          lastResetAt: now,
        },
      });
      billing.cvGenerationCount = 0;
    }

    // Verificar limite
    if (billing.cvGenerationCount >= billing.cvGenerationLimit) {
      return res.status(403).json({
        success: false,
        message: 'Limite mensal de CVs atingido',
        limit: billing.cvGenerationLimit,
        current: billing.cvGenerationCount,
        upgrade: true,
      });
    }

    // Verificar se template existe
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Verificar se template é premium e user tem acesso
    if (template.isPremium && billing.plan === 'FREE') {
      return res.status(403).json({
        success: false,
        message: 'Template premium disponível apenas para planos Pro e Career+',
        upgrade: true,
      });
    }

    // Criar CV
    const cv = await prisma.cV.create({
      data: {
        userId: userId,
        title: title,
        templateId: templateId,
        language: language,
        jobTargetTitle: jobTargetTitle,
        jobTargetArea: jobTargetArea,
        contentJson: contentJson || {},
        status: 'DRAFT',
      },
      include: {
        template: true,
      },
    });

    // Incrementar contador de CVs
    await prisma.billing.update({
      where: { userId: userId },
      data: {
        cvGenerationCount: billing.cvGenerationCount + 1,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'CV criado com sucesso',
      data: {
        cv: {
          id: cv.id,
          title: cv.title,
          status: cv.status,
          language: cv.language,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          template: {
            id: cv.template.id,
            name: cv.template.name,
            slug: cv.template.slug,
          },
          createdAt: cv.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao criar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar CV',
    });
  }
}

/**
 * Listar todos os CVs do utilizador
 * GET /api/cvs
 */

export const getCVs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, search, sortBy = 'updatedAt', order = 'desc' } = req.query;

    // Construir filtros
    const where = {
      userId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { jobTargetTitle: { contains: search, mode: 'insensitive' } },
        { jobTargetArea: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar CVs
    const cvs = await prisma.cV.findMany({
      where: where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            isPremium: true,
          },
        },
        aiReviews: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            scoreOverall: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    // Estatísticas
    const stats = {
      total: cvs.length,
      published: cvs.filter(cv => cv.status === 'PUBLISHED').length,
      draft: cvs.filter(cv => cv.status === 'DRAFT').length,
      archived: cvs.filter(cv => cv.status === 'ARCHIVED').length,
    };

    return res.status(200).json({
      success: true,
      data: {
        cvs: cvs.map(cv => ({
          id: cv.id,
          title: cv.title,
          status: cv.status,
          language: cv.language,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          template: cv.template,
          lastReview: cv.aiReviews[0] || null,
          generatedPdfUrl: cv.generatedPdfUrl,
          generatedDocxUrl: cv.generatedDocxUrl,
          viewCount: cv.viewCount,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt,
        })),
        stats: stats,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar CVs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar CVs',
    });
  }
}

/**
 * Buscar CV específico por ID
 * GET /api/cvs/:id
 */

export const getCVById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        template: true,
        aiReviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                headline: true,
                location: true,
                phone: true,
                website: true,
                linkedin: true,
                github: true,
              },
            },
          },
        },
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Incrementar contador de visualizações
    await prisma.cV.update({
      where: { id: id },
      data: {
        viewCount: cv.viewCount + 1,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        cv: {
          id: cv.id,
          title: cv.title,
          status: cv.status,
          language: cv.language,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          isAtsOptimized: cv.isAtsOptimized,
          contentJson: cv.contentJson,
          template: cv.template,
          generatedPdfUrl: cv.generatedPdfUrl,
          generatedDocxUrl: cv.generatedDocxUrl,
          viewCount: cv.viewCount + 1,
          aiReviews: cv.aiReviews,
          user: cv.user,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar CV',
    });
  }
}

/**
 * Atualizar CV
 * PUT /api/cvs/:id
 */

export const updateCV = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      templateId,
      language,
      jobTargetTitle,
      jobTargetArea,
      contentJson,
      status,
    } = req.body;

    // Verificar se CV existe e pertence ao utilizador
    const existingCV = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingCV) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Se está mudando template, verificar se é premium
    if (templateId && templateId !== existingCV.templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template não encontrado',
        });
      }

      if (template.isPremium) {
        const billing = await prisma.billing.findUnique({
          where: { userId: userId },
        });

        if (billing.plan === 'FREE') {
          return res.status(403).json({
            success: false,
            message: 'Template premium disponível apenas para planos Pro e Career+',
            upgrade: true,
          });
        }
      }
    }

    // Construir objeto de atualização
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (templateId !== undefined) updateData.templateId = templateId;
    if (language !== undefined) updateData.language = language;
    if (jobTargetTitle !== undefined) updateData.jobTargetTitle = jobTargetTitle;
    if (jobTargetArea !== undefined) updateData.jobTargetArea = jobTargetArea;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (status !== undefined) updateData.status = status;

    // Atualizar CV
    const updatedCV = await prisma.cV.update({
      where: { id: id },
      data: updateData,
      include: {
        template: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'CV atualizado com sucesso',
      data: {
        cv: {
          id: updatedCV.id,
          title: updatedCV.title,
          status: updatedCV.status,
          language: updatedCV.language,
          jobTargetTitle: updatedCV.jobTargetTitle,
          jobTargetArea: updatedCV.jobTargetArea,
          template: updatedCV.template,
          updatedAt: updatedCV.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar CV',
    });
  }
}

/**
 * Gerar PDF do CV
 * POST /api/cvs/:id/generate/pdf
 */

export const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar CV com todos os dados necessários
    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
      include: {
        template: true,
        user: {
          include: {
            profile: {
              include: {
                experiences: {
                  orderBy: { sortOrder: 'asc' },
                },
                educations: {
                  orderBy: { sortOrder: 'asc' },
                },
                skills: {
                  orderBy: { sortOrder: 'asc' },
                },
                certifications: {
                  orderBy: { sortOrder: 'asc' },
                },
                projects: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Importar services
    const PDFService = require('../services/pdf.service');
    const StorageService = require('../services/storage.service');

    // Gerar PDF
    const pdf = await PDFService.generatePDF(cv, cv.user.profile);

    // Upload para Cloudinary (se configurado)
    let pdfUrl = null;
    if (StorageService.isConfigured()) {
      try {
        const uploadResult = await StorageService.uploadCVPDF(pdf, userId, cv.id);
        pdfUrl = uploadResult.url;

        // Atualizar URL no CV
        await prisma.cV.update({
          where: { id: id },
          data: { generatedPdfUrl: pdfUrl },
        });

        console.log('✅ PDF salvo no Cloudinary:', pdfUrl);
      } catch (uploadError) {
        console.warn('⚠️ Erro ao fazer upload do PDF:', uploadError.message);
        // Continua mesmo se upload falhar
      }
    }

    // Definir headers para download
    const filename = `${cv.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);

    // Enviar PDF
    res.send(pdf);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF',
      error: error.message,
    });
  }
}

/**
 * Download PDF do CV (se já foi gerado)
 * GET /api/cvs/:id/download/pdf
 */

export const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    if (!cv.generatedPdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'PDF ainda não foi gerado. Use POST /api/cvs/:id/generate/pdf',
      });
    }

    // Redirecionar para URL do storage
    return res.redirect(cv.generatedPdfUrl);
  } catch (error) {
    console.error('Erro ao fazer download do PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer download do PDF',
    });
  }
}

export const deleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se CV existe e pertence ao utilizador
    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Apagar CV (cascade vai apagar reviews associadas)
    await prisma.cV.delete({
      where: { id: id },
    });

    // TODO: Apagar ficheiros PDF/DOCX do storage se existirem
    // if (cv.generatedPdfUrl) {
    //   await StorageService.deleteFile(cv.generatedPdfUrl);
    // }
    // if (cv.generatedDocxUrl) {
    //   await StorageService.deleteFile(cv.generatedDocxUrl);
    // }

    return res.status(200).json({
      success: true,
      message: 'CV apagado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar CV',
    });
  }
}

/**
 * Duplicar CV
 * POST /api/cvs/:id/duplicate
 */

export const duplicateCV = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se CV existe
    const originalCV = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!originalCV) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Verificar limite de CVs
    const billing = await prisma.billing.findUnique({
      where: { userId: userId },
    });

    const lastReset = new Date(billing.lastResetAt);
    const now = new Date();
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      await prisma.billing.update({
        where: { userId: userId },
        data: {
          cvGenerationCount: 0,
          lastResetAt: now,
        },
      });
      billing.cvGenerationCount = 0;
    }

    if (billing.cvGenerationCount >= billing.cvGenerationLimit) {
      return res.status(403).json({
        success: false,
        message: 'Limite mensal de CVs atingido',
        upgrade: true,
      });
    }

    // Duplicar CV
    const duplicatedCV = await prisma.cV.create({
      data: {
        userId: userId,
        title: `${originalCV.title} (Cópia)`,
        templateId: originalCV.templateId,
        language: originalCV.language,
        jobTargetTitle: originalCV.jobTargetTitle,
        jobTargetArea: originalCV.jobTargetArea,
        contentJson: originalCV.contentJson,
        status: 'DRAFT',
      },
      include: {
        template: true,
      },
    });

    // Incrementar contador
    await prisma.billing.update({
      where: { userId: userId },
      data: {
        cvGenerationCount: billing.cvGenerationCount + 1,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'CV duplicado com sucesso',
      data: {
        cv: {
          id: duplicatedCV.id,
          title: duplicatedCV.title,
          status: duplicatedCV.status,
          template: duplicatedCV.template,
          createdAt: duplicatedCV.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao duplicar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao duplicar CV',
    });
  }
}

/**
 * Alterar status do CV
 * PUT /api/cvs/:id/status
 */

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Valores permitidos: DRAFT, PUBLISHED, ARCHIVED',
      });
    }

    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    const updatedCV = await prisma.cV.update({
      where: { id: id },
      data: { status: status },
    });

    return res.status(200).json({
      success: true,
      message: 'Status do CV atualizado',
      data: {
        cv: {
          id: updatedCV.id,
          status: updatedCV.status,
          updatedAt: updatedCV.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status do CV',
    });
  }
}

/**
 * Trocar template do CV
 * PUT /api/cvs/:id/template
 */

export const changeTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { templateId } = req.body;
    const userId = req.user.id;

    // Verificar se CV existe
    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Verificar se template existe
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    // Verificar se template é premium
    if (template.isPremium) {
      const billing = await prisma.billing.findUnique({
        where: { userId: userId },
      });

      if (billing.plan === 'FREE') {
        return res.status(403).json({
          success: false,
          message: 'Template premium disponível apenas para planos Pro e Career+',
          upgrade: true,
        });
      }
    }

    // Atualizar template e limpar URLs geradas
    const updatedCV = await prisma.cV.update({
      where: { id: id },
      data: {
        templateId: templateId,
        generatedPdfUrl: null, // Limpar PDF antigo
        generatedDocxUrl: null, // Limpar DOCX antigo
      },
      include: {
        template: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Template alterado com sucesso',
      data: {
        cv: {
          id: updatedCV.id,
          template: updatedCV.template,
          updatedAt: updatedCV.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao trocar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao trocar template',
    });
  }
}