// src/controllers/cv.controller.js
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createCV = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const {
      title,
      targetRole,          // ← ADICIONAR (importante para IA)
      templateId,
      language = 'PT',
      jobTargetTitle,
      jobTargetArea,
      content,             // ← RENOMEAR de contentJson para content
      generatePdf = true,  // ← ADICIONAR flag
    } = req.body;

    // ========================================
    // 2. VERIFICAR BILLING E LIMITES
    // ========================================
    const billing = await prisma.billing.findUnique({
      where: { userId },
    });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Informações de billing não encontradas',
      });
    }

    // Reset mensal do contador
    const lastReset = new Date(billing.lastResetAt);
    const now = new Date();
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      await prisma.billing.update({
        where: { userId },
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

    // ========================================
    // 3. VERIFICAR TEMPLATE
    // ========================================
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
    if (template.isPremium && billing.plan === 'FREE') {
      return res.status(403).json({
        success: false,
        message: 'Template premium disponível apenas para planos Pro e Career+',
        upgrade: true,
      });
    }

    // ========================================
    // 4. BUSCAR PROFILE DO USER (para gerar PDF)
    // ========================================
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
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
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado. Complete seu perfil primeiro.',
      });
    }

    // ========================================
    // 5. MELHORAR CONTEÚDO COM IA ⭐⭐⭐
    // ========================================
    console.log('🤖 Melhorando conteúdo com IA...');
    
    let improvedContent = content;

    try {
      // Se user tem plano PRO ou superior, usar IA
      if (billing.plan === 'PRO' || billing.plan === 'PREMIUM') {
        improvedContent = await AIService.improveCV({
          summary: content.summary || profile.summary,
          experiences: content.experiences || profile.experiences,
          skills: content.skills || profile.skills,
          targetRole: targetRole || jobTargetTitle,
        });
      }
    } catch (aiError) {
      console.warn('⚠️ Erro ao processar com IA, usando conteúdo original:', aiError.message);
      // Continua com conteúdo original se IA falhar
    }

    // ========================================
    // 6. CRIAR CV NO BANCO DE DADOS
    // ========================================
    console.log('💾 Criando CV no banco de dados...');

    const cv = await prisma.cV.create({
      data: {
        userId,
        title,
        targetRole: targetRole || jobTargetTitle,
        templateId,
        language,
        jobTargetTitle,
        jobTargetArea,
        contentJson: improvedContent, // ← Conteúdo melhorado pela IA
        status: 'DRAFT',
      },
      include: {
        template: true,
      },
    });

    // ========================================
    // 7. GERAR PDF (se solicitado) ⭐⭐⭐
    // ========================================
    let pdfUrl = null;

    if (generatePdf) {
      try {
        console.log('📄 Gerando PDF...');

        // 7.1: Buscar CV com todas as relações (para PDF)
        const cvForPDF = await prisma.cV.findUnique({
          where: { id: cv.id },
          include: {
            template: true,
            user: {
              include: {
                profile: {
                  include: {
                    experiences: { orderBy: { sortOrder: 'asc' } },
                    educations: { orderBy: { sortOrder: 'asc' } },
                    skills: { orderBy: { sortOrder: 'asc' } },
                    certifications: { orderBy: { sortOrder: 'asc' } },
                    projects: { orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
          },
        });

        // 7.2: Gerar PDF
        const pdfBuffer = await PDFService.generatePDF(cvForPDF, profile);

        // 7.3: Upload para Cloudinary
        if (StorageService.isConfigured()) {
          const uploadResult = await StorageService.uploadCVPDF(
            pdfBuffer,
            userId,
            cv.id
          );
          pdfUrl = uploadResult.url;

          // 7.4: Atualizar CV com URL do PDF
          await prisma.cV.update({
            where: { id: cv.id },
            data: { 
              generatedPdfUrl: pdfUrl,
              status: 'PUBLISHED', // ← Publicar após gerar PDF
            },
          });

          console.log('✅ PDF gerado e salvo:', pdfUrl);
        }
      } catch (pdfError) {
        console.error('⚠️ Erro ao gerar PDF:', pdfError.message);
        // CV continua criado, mas sem PDF
        // User pode tentar gerar depois
      }
    }

    // ========================================
    // 8. INCREMENTAR CONTADOR DE CVs
    // ========================================
    await prisma.billing.update({
      where: { userId },
      data: {
        cvGenerationCount: { increment: 1 },
      },
    });

    // ========================================
    // 9. RETORNAR RESPOSTA
    // ========================================
    return res.status(201).json({
      success: true,
      message: 'CV criado com sucesso',
      data: {
        cv: {
          id: cv.id,
          title: cv.title,
          targetRole: cv.targetRole,
          status: pdfUrl ? 'PUBLISHED' : 'DRAFT',
          language: cv.language,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          generatedPdfUrl: pdfUrl, // ← IMPORTANTE!
          template: {
            id: cv.template.id,
            name: cv.template.name,
            slug: cv.template.slug,
            type: cv.template.type,
          },
          createdAt: cv.createdAt,
          aiImproved: billing.plan !== 'FREE', // ← Indica se usou IA
        },
        billing: {
          cvGenerationCount: billing.cvGenerationCount + 1,
          cvGenerationLimit: billing.cvGenerationLimit,
          plan: billing.plan,
        },
      },
    });

  } catch (error) {
    console.error('❌ Erro ao criar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


export const getCVs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      status, 
      search, 
      sortBy = 'updatedAt', 
      order = 'desc',
      page = 1,        // ⭐ ADICIONAR paginação
      limit = 10       // ⭐ ADICIONAR limite
    } = req.query;

    // ========================================
    // VALIDAÇÃO DE SORTBY (segurança)
    // ========================================
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'updatedAt';
    const validOrder = order === 'asc' ? 'asc' : 'desc';

    // ========================================
    // CONSTRUIR FILTROS
    // ========================================
    const where = {
      userId,
    };

    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { targetRole: { contains: search, mode: 'insensitive' } }, // ⭐ CORRIGIR nome
        { jobTargetArea: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ========================================
    // PAGINAÇÃO
    // ========================================
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // ========================================
    // BUSCAR CVs COM PAGINAÇÃO
    // ========================================
    const [cvs, totalCount] = await Promise.all([
      prisma.cV.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              isPremium: true,
              previewUrl: true, // ⭐ ADICIONAR
            },
          },
          aiReviews: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              scoreOverall: true,
              scores: true, // ⭐ ADICIONAR scores detalhados
              createdAt: true,
            },
          },
        },
        orderBy: {
          [validSortBy]: validOrder,
        },
        skip,
        take,
      }),
      prisma.cV.count({ where }), // ⭐ Total para paginação
    ]);

    // ========================================
    // ESTATÍSTICAS (sobre TODOS os CVs do user)
    // ========================================
    const allCVs = await prisma.cV.findMany({
      where: { userId },
      select: { status: true },
    });

    const stats = {
      total: allCVs.length,
      published: allCVs.filter(cv => cv.status === 'PUBLISHED').length,
      draft: allCVs.filter(cv => cv.status === 'DRAFT').length,
      archived: allCVs.filter(cv => cv.status === 'ARCHIVED').length,
    };

    // ========================================
    // RESPONSE COM PAGINAÇÃO
    // ========================================
    return res.status(200).json({
      success: true,
      data: {
        cvs: cvs.map(cv => ({
          id: cv.id,
          title: cv.title,
          targetRole: cv.targetRole, // ⭐ CORRIGIR nome
          status: cv.status,
          language: cv.language,
          template: cv.template,
          lastReview: cv.aiReviews[0] || null,
          generatedPdfUrl: cv.generatedPdfUrl,
          generatedDocxUrl: cv.generatedDocxUrl,
          viewCount: cv.viewCount,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt,
        })),
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + take < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar CVs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar CVs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getCVById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const cv = await prisma.cV.findFirst({
      where: {
        id,
        userId,
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
            email: true, // ⭐ Só mostra email se for dono
            profile: {
              select: {
                headline: true,
                summary: true, // ⭐ ADICIONAR
                location: true,
                phone: true,
                website: true,
                linkedin: true,
                github: true,
                languages: true, // ⭐ ADICIONAR
                // ⭐ ADICIONAR relações completas
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

    if (cv.user.id !== userId) {
      cv.user.email = undefined;
    }

    // ========================================
    // INCREMENTAR CONTADOR DE VISUALIZAÇÕES
    // ========================================
    await prisma.cV.update({
      where: { id },
      data: {
        viewCount: { increment: 1 }, // ⭐ Usar increment (mais seguro)
      },
    });

    // ========================================
    // RESPONSE COMPLETO
    // ========================================
    return res.status(200).json({
      success: true,
      data: {
        cv: {
          id: cv.id,
          title: cv.title,
          targetRole: cv.targetRole, // ⭐ CORRIGIR nome
          status: cv.status,
          language: cv.language,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          isAtsOptimized: cv.isAtsOptimized,
          content: cv.content, // ⭐ CORRIGIR de contentJson
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
    console.error('❌ Erro ao buscar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


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
      targetRole,        // ⭐ ADICIONAR
      templateId,
      language,
      jobTargetTitle,
      jobTargetArea,
      content,           // ⭐ CORRIGIR de contentJson
      status,
      regeneratePdf,     // ⭐ ADICIONAR flag
      improveWithAI,     // ⭐ ADICIONAR flag
    } = req.body;

    // ========================================
    // VERIFICAR SE CV EXISTE E PERTENCE AO USER
    // ========================================
    const existingCV = await prisma.cV.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        template: true,
        user: {
          include: {
            profile: {
              include: {
                experiences: true,
                educations: true,
                skills: true,
                certifications: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!existingCV) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // ========================================
    // VERIFICAR TEMPLATE (se está mudando)
    // ========================================
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
          where: { userId },
        });

        if (billing?.plan === 'FREE') {
          return res.status(403).json({
            success: false,
            message: 'Template premium disponível apenas para planos Pro e Career+',
            upgrade: true,
          });
        }
      }
    }

    // ========================================
    // MELHORAR CONTEÚDO COM IA (se solicitado)
    // ========================================
    let finalContent = content || existingCV.content;

    if (improveWithAI && content) {
      try {
        const billing = await prisma.billing.findUnique({
          where: { userId },
        });

        if (billing?.plan !== 'FREE') {
          console.log('🤖 Melhorando conteúdo atualizado com IA...');
          
          finalContent = await AIService.improveCV({
            summary: content.summary,
            experiences: content.experiences,
            skills: content.skills,
            targetRole: targetRole || jobTargetTitle,
          });
        }
      } catch (aiError) {
        console.warn('⚠️ Erro ao processar com IA:', aiError.message);
        // Continua com conteúdo original
      }
    }

    // ========================================
    // CONSTRUIR OBJETO DE ATUALIZAÇÃO
    // ========================================
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (templateId !== undefined) updateData.templateId = templateId;
    if (language !== undefined) updateData.language = language;
    if (jobTargetTitle !== undefined) updateData.jobTargetTitle = jobTargetTitle;
    if (jobTargetArea !== undefined) updateData.jobTargetArea = jobTargetArea;
    if (finalContent !== undefined) updateData.content = finalContent;
    if (status !== undefined) updateData.status = status;

    // ⭐ Se conteúdo mudou, invalidar PDFs antigos
    if (content !== undefined && !regeneratePdf) {
      updateData.generatedPdfUrl = null;
      updateData.generatedDocxUrl = null;
    }

    // ========================================
    // ATUALIZAR CV
    // ========================================
    const updatedCV = await prisma.cV.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
      },
    });

    // ========================================
    // REGENERAR PDF (se solicitado)
    // ========================================
    let pdfUrl = updatedCV.generatedPdfUrl;

    if (regeneratePdf) {
      try {
        console.log('📄 Regenerando PDF...');

        const cvForPDF = await prisma.cV.findUnique({
          where: { id },
          include: {
            template: true,
            user: {
              include: {
                profile: {
                  include: {
                    experiences: { orderBy: { sortOrder: 'asc' } },
                    educations: { orderBy: { sortOrder: 'asc' } },
                    skills: { orderBy: { sortOrder: 'asc' } },
                    certifications: { orderBy: { sortOrder: 'asc' } },
                    projects: { orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
          },
        });

        const pdfBuffer = await PDFService.generatePDF(cvForPDF, cvForPDF.user.profile);

        if (StorageService.isConfigured()) {
          const uploadResult = await StorageService.uploadCVPDF(
            pdfBuffer,
            userId,
            id
          );
          pdfUrl = uploadResult.url;

          await prisma.cV.update({
            where: { id },
            data: { generatedPdfUrl: pdfUrl },
          });
        }
      } catch (pdfError) {
        console.error('⚠️ Erro ao regenerar PDF:', pdfError.message);
      }
    }

    // ========================================
    // RESPONSE
    // ========================================
    return res.status(200).json({
      success: true,
      message: 'CV atualizado com sucesso',
      data: {
        cv: {
          id: updatedCV.id,
          title: updatedCV.title,
          targetRole: updatedCV.targetRole,
          status: updatedCV.status,
          language: updatedCV.language,
          template: updatedCV.template,
          generatedPdfUrl: pdfUrl,
          updatedAt: updatedCV.updatedAt,
          aiImproved: improveWithAI,
          pdfRegenerated: regeneratePdf,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


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