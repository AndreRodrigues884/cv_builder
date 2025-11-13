// src/controllers/cv.controller.js
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import AIService from '../services/ai.services.js'
import PDFService from '../services/pdf.service.js'
import StorageService from '../services/storage.services.js'

const prisma = new PrismaClient();

export const createCV = async (req, res) => {
  try {
    // 🧩 1️⃣ Validação inicial
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const userId = req.user.id
    const {
      title,
      targetRole,
      templateId,
      language = 'PT',
      jobTargetTitle,
      jobTargetArea,
      contentJson,
      generatePdf = true,
    } = req.body

    console.log('📝 Criando CV:', { title, targetRole, templateId })

    // 💳 2️⃣ Billing / Plano
    const billing = await prisma.billing.findUnique({ where: { userId } })
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Informações de billing não encontradas'
      })
    }

    // Reset mensal de contador
    const now = new Date()
    const lastReset = new Date(billing.lastResetAt)
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()

    if (shouldReset) {
      await prisma.billing.update({
        where: { userId },
        data: { cvGenerationCount: 0, lastResetAt: now },
      })
      billing.cvGenerationCount = 0
    }

    // Verificar limite
    if (billing.cvGenerationCount >= billing.cvGenerationLimit) {
      return res.status(403).json({
        success: false,
        message: 'Limite mensal de CVs atingido',
        limit: billing.cvGenerationLimit,
        current: billing.cvGenerationCount,
        upgrade: true,
      })
    }

    // 🧱 3️⃣ Template
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      })
    }

    if (template.isPremium && billing.plan === 'FREE') {
      return res.status(403).json({
        success: false,
        message: 'Template premium disponível apenas para planos Pro e Career+',
        upgrade: true,
      })
    }

    // 👤 4️⃣ Perfil do usuário
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        certifications: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado. Complete seu perfil primeiro.',
      })
    }

    // 🧠 5️⃣ IA (melhora conteúdo, se plano PRO+)
    let improvedContent = contentJson
    let aiUsed = false

    if (['PRO', 'PREMIUM'].includes(billing.plan)) {
      try {
        console.log('🤖 Melhorando conteúdo com IA...')

        improvedContent = await AIService.improveCV({
          summary: contentJson?.summary || profile.summary,
          experiences: contentJson?.experiences || profile.experiences,
          skills: contentJson?.skills || profile.skills,
          targetRole: targetRole || jobTargetTitle,
        })

        aiUsed = true
        console.log('✅ Conteúdo melhorado com IA')
      } catch (err) {
        console.warn('⚠️ IA falhou, mantendo conteúdo original:', err.message)
      }
    }

    // 💾 6️⃣ Criar CV na BD
    console.log('💾 Salvando CV na base de dados...')

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
        status: generatePdf ? 'DRAFT' : 'DRAFT', // Será PUBLISHED após PDF
      },
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
              }
            }
          }
        }
      },
    })

    console.log('✅ CV criado:', cv.id)

    // 📄 7️⃣ Geração e upload do PDF (se solicitado)
    let pdfUrl = null

    if (generatePdf) {
      try {
        console.log('📄 Gerando PDF...')

        // Gerar PDF buffer
        const pdfBuffer = await PDFService.generatePDFBufferForCV(cv, profile)

        console.log('✅ PDF gerado, tamanho:', pdfBuffer.length, 'bytes')

        // Upload para Cloudinary (se configurado)
        if (StorageService.isConfigured()) {
          console.log('☁️ Fazendo upload para Cloudinary...')

          const upload = await StorageService.uploadCVPDF(
            pdfBuffer,
            userId,
            cv.id
          )

          pdfUrl = upload.url
          console.log('✅ PDF uploaded:', pdfUrl)

          // Atualizar CV com URL do PDF e status PUBLISHED
          await prisma.cV.update({
            where: { id: cv.id },
            data: {
              generatedPdfUrl: pdfUrl,
              status: 'PUBLISHED'
            },
          })
        } else {
          console.warn('⚠️ Cloudinary não configurado, PDF não será salvo')
        }
      } catch (err) {
        console.error('❌ Falha ao gerar/upload PDF:', err.message)
        console.error(err.stack)
        // CV continua criado, mas sem PDF
      }
    }

    // 📈 8️⃣ Atualizar contador de billing
    await prisma.billing.update({
      where: { userId },
      data: { cvGenerationCount: { increment: 1 } },
    })

    // ✅ 9️⃣ Resposta final
    return res.status(201).json({
      success: true,
      message: pdfUrl ? 'CV criado e PDF gerado com sucesso' : 'CV criado com sucesso',
      data: {
        cv: {
          id: cv.id,
          title: cv.title,
          status: pdfUrl ? 'PUBLISHED' : 'DRAFT',
          language: cv.language,
          targetRole: cv.targetRole,
          jobTargetTitle: cv.jobTargetTitle,
          jobTargetArea: cv.jobTargetArea,
          generatedPdfUrl: pdfUrl,
          template: {
            id: template.id,
            name: template.name,
            slug: template.slug,
            type: template.type,
          },
          contentJson: cv.contentJson,
          createdAt: cv.createdAt,
          aiImproved: aiUsed,
        },
        billing: {
          cvGenerationCount: billing.cvGenerationCount + 1,
          cvGenerationLimit: billing.cvGenerationLimit,
          plan: billing.plan,
        },
      },
    })
  } catch (error) {
    console.error('❌ Erro ao criar CV:', error)
    console.error(error.stack)

    return res.status(500).json({
      success: false,
      message: 'Erro ao criar CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

export const getCVs = async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;

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
    const userId = req.user.id;
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

export const downloadCV = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Validar que id é uma string válida
    if (!id || typeof id !== 'string') {
      console.error('❌ ID inválido recebido:', { id, type: typeof id, params: req.params })
      return res.status(400).json({
        success: false,
        message: 'ID do CV inválido',
      })
    }

    console.log('⬇️ Download CV solicitado:', { cvId: id, userId, idType: typeof id })

    // 1️⃣ Buscar CV com template
    const cv = await prisma.cV.findFirst({
      where: { id, userId },
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
              }
            }
          }
        }
      },
    })

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      })
    }

    // 2️⃣ Se PDF já existe no Cloudinary, fazer download direto
    if (cv.generatedPdfUrl) {
      try {
        console.log('📥 Baixando PDF existente do Cloudinary:', cv.generatedPdfUrl)

        const response = await fetch(cv.generatedPdfUrl)

        if (!response.ok) {
          throw new Error(`Falha ao baixar PDF: ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${cv.title}.pdf"`)

        console.log('✅ PDF enviado ao cliente')
        return res.send(Buffer.from(buffer))
      } catch (fetchError) {
        console.warn('⚠️ Erro ao baixar PDF do Cloudinary, gerando novo:', fetchError.message)
        // Continua para gerar novo PDF
      }
    }

    // 3️⃣ Buscar perfil do usuário (se não veio no include acima)
    const profile = cv.user?.profile || await prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        certifications: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado',
      })
    }

    // 4️⃣ Gerar PDF buffer
    console.log('📄 Gerando novo PDF...')

    const pdfBuffer = await PDFService.generatePDFBufferForCV(cv, profile)

    console.log('✅ PDF gerado, tamanho:', pdfBuffer.length, 'bytes')

    // 5️⃣ Upload para Cloudinary (opcional, para cache)
    if (StorageService.isConfigured() && !cv.generatedPdfUrl) {
      try {
        console.log('☁️ Salvando PDF no Cloudinary...')

        const upload = await StorageService.uploadCVPDF(pdfBuffer, userId, cv.id)

        await prisma.cV.update({
          where: { id: cv.id },
          data: {
            generatedPdfUrl: upload.url,
            status: 'PUBLISHED'
          },
        })

        console.log('✅ PDF salvo no Cloudinary:', upload.url)
      } catch (uploadError) {
        console.warn('⚠️ Falha ao upload no Cloudinary:', uploadError.message)
        // Continua, PDF será enviado mesmo sem upload
      }
    }

    // 6️⃣ Enviar PDF ao cliente
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    console.log('✅ Enviando PDF ao cliente, tamanho:', pdfBuffer.length, 'bytes')
    return res.send(pdfBuffer)

  } catch (error) {
    console.error('❌ Erro ao fazer download do CV:', error)
    console.error(error.stack)

    return res.status(500).json({
      success: false,
      message: 'Erro ao baixar o CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

/**
 * Preview do CV (retorna HTML renderizado)
 * GET /api/cv/:id/preview
 */
export const previewCV = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('👁️ Preview CV solicitado:', { cvId: id, userId });

    // 1️⃣ Buscar CV com template
    const cv = await prisma.cV.findFirst({
      where: { id, userId },
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

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // 2️⃣ Buscar perfil do usuário
    const profile = cv.user?.profile || await prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        certifications: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado',
      });
    }

    // 3️⃣ Gerar HTML renderizado
    console.log('📄 Gerando preview HTML...');
    const html = await PDFService.generateHTMLForCV(cv, profile);

    console.log('✅ Preview HTML gerado');

    // 4️⃣ Enviar HTML ao cliente
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    console.error('❌ Erro ao gerar preview do CV:', error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar preview do CV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const downloadCVDOCX = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Exportação para DOCX ainda não implementada.',
  });
};

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