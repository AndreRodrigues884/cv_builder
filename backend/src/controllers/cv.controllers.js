// src/controllers/cv.controller.js
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import PDFService from '../services/pdf.service.js';
import path from 'path';
import fs from 'fs/promises';

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
      contentJson,
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

    let improvedContent = contentJson;

    try {
      // Se user tem plano PRO ou superior, usar IA
      if (billing.plan === 'PRO' || billing.plan === 'PREMIUM') {
        improvedContent = await AIService.improveCV({
          summary: contentJson.summary || profile.summary,
          experiences: contentJson.experiences || profile.experiences,
          skills: contentJson.skills || profile.skills,
          targetRole: targetRole || jobTargetTitle,
        });
      }
    } catch (aiError) {
      console.warn('⚠️ Erro ao processar com IA, usando conteúdo original:', aiError.message);
      // Continua com conteúdo original se IA falhar
    }

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
        contentJson: improvedContent,
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
          generatedPdfUrl: pdfUrl,
          template: {
            id: cv.template.id,
            name: cv.template.name,
            slug: cv.template.slug,
            type: cv.template.type,
          },
          contentJson: cv.contentJson,
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
      page = 1,
      limit = 10
    } = req.query;

    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'updatedAt';
    const validOrder = order === 'asc' ? 'asc' : 'desc';


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
        select: {
          id: true,
          title: true,
          targetRole: true,
          status: true,
          language: true,
          templateId: true,
          contentJson: true, 
          generatedPdfUrl: true,
          generatedDocxUrl: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          template: {
            select: { id: true, name: true, slug: true, type: true, isPremium: true, previewUrl: true },
          },
          aiReviews: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              scoreOverall: true,
              scoreAts: true,
              scoreLanguage: true,
              scoreImpact: true,
              scoreClarity: true,
              createdAt: true,
              recommendations: true,
              missingKeywords: true,
              strengths: true,
              improvements: true,
              estimatedReadTime: true,
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
          targetRole: cv.targetRole,
          status: cv.status,
          language: cv.language,
          templateId: cv.templateId,
          template: cv.template?.name || 'Modern',
          contentJson: cv.contentJson,
          lastReview: cv.aiReviews[0] || null,
          generatedPdfUrl: cv.generatedPdfUrl,
          generatedDocxUrl: cv.generatedDocxUrl,
          viewCount: cv.viewCount,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt,
          statusColor: cv.status === 'PUBLISHED'
            ? 'bg-green-500/20 text-green-400'
            : cv.status === 'DRAFT'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-slate-500/20 text-slate-400',
          icon: '📄',
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
          contentJson: cv.contentJson, // ⭐ CORRIGIR de contentJson
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
    const userId = req.user.userId;
    const {
      title,
      targetRole,
      templateId,
      language,
      jobTargetTitle,
      jobTargetArea,
      contentJson,           // ⭐ CORRIGIR de contentJson
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
    let finalContent = contentJson || existingCV.contentJson;

    if (improveWithAI && contentJson) {
      try {
        const billing = await prisma.billing.findUnique({
          where: { userId },
        });

        if (billing?.plan !== 'FREE') {
          console.log('🤖 Melhorando conteúdo atualizado com IA...');

          finalContent = await AIService.improveCV({
            summary: contentJson.summary,
            experiences: contentJson.experiences,
            skills: contentJson.skills,
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
    if (finalContent !== undefined) updateData.contentJson = finalContent;
    if (status !== undefined) updateData.status = status;

    // ⭐ Se conteúdo mudou, invalidar PDFs antigos
    if (contentJson !== undefined && !regeneratePdf) {
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
          contentJson: updatedCV.contentJson,
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

export const downloadCVPDF = async (req, res) => {
  try {
    const cvId = req.params.id;
    const userId = req.user?.id || req.user?.userId; // ← Tenta ambos

    console.log('👤 User ID:', userId);
    console.log('📄 CV ID:', cvId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador não autenticado',
      });
    }

    // Buscar CV completo com profile
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: userId,
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

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    console.log('📄 Gerando PDF para CV:', cv.id);

    // Preparar dados combinados (contentJson + profile)
    const profileForPdf = {
      ...cv.user.profile,
      user: cv.user,
    };

    // Gerar PDF
    const pdfBuffer = await PDFService.generatePDF(cv, profileForPdf);

    // Converte para Buffer se for Uint8Array
    const pdfBufferFinal = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    // Salvar PDF no servidor
    const filename = `cv_${userId}_${cvId}_${Date.now()}.pdf`;
    const cvsDir = path.join(process.cwd(), 'cloudinary', 'cvs');

    // Criar diretório se não existir
    await fs.mkdir(cvsDir, { recursive: true });

    const filepath = path.join(cvsDir, filename);
    await fs.writeFile(filepath, pdfBufferFinal);

    // Atualizar URL no CV
    const pdfUrl = `/cvs/${filename}`;
    await prisma.cV.update({
      where: { id: cvId },
      data: { generatedPdfUrl: pdfUrl },
    });

    console.log('✅ PDF gerado e salvo:', pdfUrl);

    // Enviar PDF para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cv.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'CV'}.pdf"`);
    res.setHeader('Content-Length', pdfBufferFinal.length);
    res.setHeader('Cache-Control', 'no-cache');

    // IMPORTANTE: Enviar como Buffer
    return res.end(pdfBufferFinal, 'binary');

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF do CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const downloadCVDOCX = async (req, res) => {
  try {
    const cvId = req.params.id;
    const userId = req.user.id;

    // Buscar CV
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: userId,
      },
      include: {
        user: {
          include: {
            profile: {
              include: {
                experiences: true,
                educations: true,
                skills: true,
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

    return res.status(501).json({
      success: false,
      message: 'Geração de DOCX em desenvolvimento',
    });

  } catch (error) {
    console.error('Erro ao gerar DOCX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar DOCX do CV',
    });
  }
};

export const getCVPdfUrl = async (req, res) => {
  try {
    const cvId = req.params.id;
    const userId = req.user.id;

    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId: userId,
      },
      select: {
        id: true,
        generatedPdfUrl: true,
        generatedDocxUrl: true,
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    return res.json({
      success: true,
      data: {
        pdfUrl: cv.generatedPdfUrl,
        docxUrl: cv.generatedDocxUrl,
      },
    });

  } catch (error) {
    console.error('Erro ao obter URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter URLs do CV',
    });
  }
};

export const deleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

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

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

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

export const changeTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { templateId } = req.body;
    const userId = req.user.userId;

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