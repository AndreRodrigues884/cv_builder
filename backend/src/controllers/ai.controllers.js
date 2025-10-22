// src/controllers/ai.controller.js
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import AIService from '../services/ai.service';

const prisma = new PrismaClient();

  /**
   * AI Review - Analisar e pontuar CV
   * POST /api/ai/review
   */
  export const reviewCV = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { cvId } = req.body;
      const userId = req.user.id;

      // Verificar se CV existe e pertence ao utilizador
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

      // Chamar serviço de IA para analisar CV
      const aiAnalysis = await AIService.analyzeCV(cv);

      // Guardar review na BD
      const review = await prisma.aIReview.create({
        data: {
          cvId: cv.id,
          scoreOverall: aiAnalysis.scores.overall,
          scoreAts: aiAnalysis.scores.ats,
          scoreLanguage: aiAnalysis.scores.language,
          scoreImpact: aiAnalysis.scores.impact,
          scoreClarity: aiAnalysis.scores.clarity,
          recommendations: aiAnalysis.recommendations,
          missingKeywords: aiAnalysis.missingKeywords,
          strengths: aiAnalysis.strengths,
          improvements: aiAnalysis.improvements,
          estimatedReadTime: aiAnalysis.estimatedReadTime,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'CV analisado com sucesso',
        data: {
          review: {
            id: review.id,
            scores: {
              overall: review.scoreOverall,
              ats: review.scoreAts,
              language: review.scoreLanguage,
              impact: review.scoreImpact,
              clarity: review.scoreClarity,
            },
            recommendations: review.recommendations,
            missingKeywords: review.missingKeywords,
            strengths: review.strengths,
            improvements: review.improvements,
            estimatedReadTime: review.estimatedReadTime,
            createdAt: review.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Erro no AI Review:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao analisar CV',
      });
    }
  }

  /**
   * Obter última review de um CV
   * GET /api/ai/review/:cvId
   */
  export const getReview = async (req, res) => {
    try {
      const { cvId } = req.params;
      const userId = req.user.id;

      // Verificar se CV pertence ao utilizador
      const cv = await prisma.cV.findFirst({
        where: {
          id: cvId,
          userId: userId,
        },
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'CV não encontrado',
        });
      }

      // Buscar última review
      const review = await prisma.aIReview.findFirst({
        where: { cvId: cvId },
        orderBy: { createdAt: 'desc' },
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma review encontrada para este CV',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          review: {
            id: review.id,
            scores: {
              overall: review.scoreOverall,
              ats: review.scoreAts,
              language: review.scoreLanguage,
              impact: review.scoreImpact,
              clarity: review.scoreClarity,
            },
            recommendations: review.recommendations,
            missingKeywords: review.missingKeywords,
            strengths: review.strengths,
            improvements: review.improvements,
            estimatedReadTime: review.estimatedReadTime,
            createdAt: review.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Erro ao obter review:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter review',
      });
    }
  }

  /**
   * Histórico de reviews de um CV
   * GET /api/ai/review/:cvId/history
   */
  export const getReviewHistory = async (req, res) => {
    try {
      const { cvId } = req.params;
      const userId = req.user.id;

      // Verificar se CV pertence ao utilizador
      const cv = await prisma.cV.findFirst({
        where: {
          id: cvId,
          userId: userId,
        },
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'CV não encontrado',
        });
      }

      // Buscar todas as reviews
      const reviews = await prisma.aIReview.findMany({
        where: { cvId: cvId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          scoreOverall: true,
          scoreAts: true,
          scoreLanguage: true,
          scoreImpact: true,
          scoreClarity: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews: reviews,
          count: reviews.length,
        },
      });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter histórico de reviews',
      });
    }
  }

  /**
   * Melhorar texto de uma secção
   * POST /api/ai/improve-text
   */
   export const improveText = async (req, res) => {
    try {
      const { text, section, context } = req.body;

      if (!text || !section) {
        return res.status(400).json({
          success: false,
          message: 'Texto e secção são obrigatórios',
        });
      }

      // Chamar IA para melhorar texto
      const result = await AIService.improveText(text, section, context);

      return res.status(200).json({
        success: true,
        data: {
          original: text,
          improved: result.improved,
          suggestions: result.suggestions,
        },
      });
    } catch (error) {
      console.error('Erro ao melhorar texto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao melhorar texto',
      });
    }
  }

  /**
   * Sugerir competências baseadas no perfil
   * POST /api/ai/suggest-skills
   */
     export const suggestSkills = async (req, res) => {
    try {
      const userId = req.user.id;
      const { jobTitle, jobArea } = req.body;

      // Buscar perfil do utilizador
      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
        include: {
          experiences: true,
          skills: true,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado',
        });
      }

      // Chamar IA para sugerir skills
      const result = await AIService.suggestSkills(profile, jobTitle, jobArea);

      return res.status(200).json({
        success: true,
        data: {
          suggestions: result.suggestions,
          currentSkills: profile.skills.map(s => s.name),
        },
      });
    } catch (error) {
      console.error('Erro ao sugerir skills:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao sugerir competências',
      });
    }
  }

  /**
   * Gerar sumário profissional com IA
   * POST /api/ai/generate-summary
   */
  export const generateSummary = async (req, res) => {
    try {
      const userId = req.user.id;
      const { jobTitle, targetArea, tone } = req.body;

      // Buscar dados do utilizador
      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
        include: {
          experiences: true,
          educations: true,
          skills: true,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado',
        });
      }

      // Chamar IA para gerar sumário
      const result = await AIService.generateSummary(profile, jobTitle, targetArea, tone);

      return res.status(200).json({
        success: true,
        data: {
          summary: result.summary,
          variations: result.variations,
          tips: result.tips,
        },
      });
    } catch (error) {
      console.error('Erro ao gerar sumário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar sumário',
      });
    }
  }

  /**
   * Otimizar CV para ATS
   * POST /api/ai/optimize-ats
   */
  
  export const optimizeForATS = async (req, res) => {
    try {
      const { cvId } = req.body;
      const userId = req.user.id;

      const cv = await prisma.cV.findFirst({
        where: {
          id: cvId,
          userId: userId,
        },
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'CV não encontrado',
        });
      }

      // Chamar IA para otimizar
      const result = await AIService.optimizeForATS(cv);

      return res.status(200).json({
        success: true,
        data: {
          optimizations: result.optimizations,
          atsScore: result.atsScore,
          maxScore: 100,
          improvements: result.improvements,
        },
      });
    } catch (error) {
      console.error('Erro ao otimizar para ATS:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao otimizar CV',
      });
    }
  }

  /**
   * Gerar perguntas de entrevista (Career Copilot)
   * POST /api/ai/interview-questions
   */
  export const generateInterviewQuestions = async (req, res) => {
    try {
      const { cvId, jobDescription } = req.body;
      const userId = req.user.id;

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

      // Gerar perguntas com IA
      const result = await AIService.generateInterviewQuestions(cv, jobDescription);

      return res.status(200).json({
        success: true,
        data: {
          questions: result.questions,
          totalQuestions: result.questions.length,
          preparationTips: result.preparationTips,
        },
      });
    } catch (error) {
      console.error('Erro ao gerar perguntas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar perguntas de entrevista',
      });
    }
  }

  /**
   * Sugerir caminhos de carreira (Career Copilot)
   * POST /api/ai/career-path
   */
  export const suggestCareerPath = async (req, res) => {

    try {
      const userId = req.user.id;

      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
        include: {
          experiences: true,
          educations: true,
          skills: true,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado',
        });
      }

      // Analisar carreira com IA
      const result = await AIService.analyzeCareerPath(profile);

      return res.status(200).json({
        success: true,
        data: {
          currentRole: result.currentRole,
          suggestedPaths: result.suggestedPaths,
          insights: result.insights,
        },
      });
    } catch (error) {
      console.error('Erro ao sugerir carreira:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao sugerir caminhos de carreira',
      });
    }
  }

  /**
   * Identificar lacunas de competências (Career Copilot)
   * POST /api/ai/skill-gaps
   */
  export const analyzeSkillGaps = async (req, res) => {
    try {
      const userId = req.user.id;
      const { targetRole, targetCompany } = req.body;

      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
        include: {
          skills: true,
          experiences: true,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado',
        });
      }

      // Analisar gaps com IA
      const result = await AIService.analyzeSkillGaps(profile, targetRole);

      return res.status(200).json({
        success: true,
        data: {
          targetRole: targetRole || 'Senior Developer',
          skillGaps: result.skillGaps,
          priorityActions: result.priorityActions,
        },
      });
    } catch (error) {
      console.error('Erro ao analisar gaps:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao analisar lacunas',
      });
    }
  }

  /**
   * Recomendar cursos/formações (Career Copilot)
   * POST /api/ai/course-recommendations
   */
  export const recommendCourses = async (req, res) => {
    try {
      const userId = req.user.id;
      const { skillGaps, budget, timeAvailable } = req.body;

      // Recomendar cursos com IA
      const result = await AIService.recommendCourses(skillGaps, budget, timeAvailable);

      return res.status(200).json({
        success: true,
        data: {
          recommendations: result.recommendations,
          totalCost: result.totalCost,
          totalTime: result.recommendations.reduce((sum, course) => {
            const duration = parseInt(course.duration);
            return sum + (isNaN(duration) ? 0 : duration);
          }, 0) + ' horas',
          learningPlan: result.learningPlan,
        },
      });
    } catch (error) {
      console.error('Erro ao recomendar cursos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao recomendar cursos',
      });
    }
  }

  /**
   * Comparar CV com benchmark da indústria
   * POST /api/ai/benchmark
   */
  export const benchmarkCV = async (req, res) => {
    try {
      const { cvId, industry } = req.body;
      const userId = req.user.id;

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

      // Mock data para benchmark
      const benchmark = {
        industry: industry || cv.jobTargetArea || 'Tecnologia',
        yourScore: 85,
        industryAverage: 72,
        topPerformers: 92,
        breakdown: {
          experience: { yours: 8, average: 6, top: 10 },
          education: { yours: 4, average: 3, top: 5 },
          skills: { yours: 12, average: 8, top: 15 },
          certifications: { yours: 2, average: 1, top: 4 },
        },
        recommendations: [
          'Adiciona mais certificações para atingir o top 10%',
          'Teu nível de experiência está acima da média',
          'Considera adicionar mais skills técnicas',
        ],
      };

      return res.status(200).json({
        success: true,
        data: { benchmark },
      });
    } catch (error) {
      console.error('Erro ao comparar com benchmark:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao comparar CV',
      });
    }
  }

  /**
   * Adaptar CV para vaga específica (AI Job Match)
   * POST /api/ai/adapt-cv
   */

  export const adaptCVToJob = async (req, res) => {
    try {
      const { cvId, jobDescription, jobUrl } = req.body;
      const userId = req.user.id;

      if (!jobDescription && !jobUrl) {
        return res.status(400).json({
          success: false,
          message: 'Descrição da vaga ou URL é obrigatória',
        });
      }

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

      // Guardar informação da vaga
      const jobImport = await prisma.jobImport.create({
        data: {
          userId: userId,
          sourceUrl: jobUrl,
          jobTitle: 'Cargo extraído', // TODO: extrair do jobDescription
          parsedText: jobDescription,
          extractedSkills: [], // TODO: extrair skills
        },
      });

      // Mock data de adaptação
      const adaptedContent = {
        matchScore: 87,
        missingSkills: ['Kubernetes', 'GraphQL'],
        highlightedSkills: ['React', 'Node.js', 'TypeScript'],
        suggestedChanges: [
          {
            section: 'summary',
            original: cv.contentJson.summary || '',
            suggested: 'Versão adaptada para esta vaga...',
            reason: 'Alinhamento com requisitos da vaga',
          },
          {
            section: 'skills',
            action: 'add',
            items: ['Docker', 'CI/CD'],
            reason: 'Skills mencionadas na descrição da vaga',
          },
        ],
        recommendations: [
          'Adiciona "Docker" às tuas competências',
          'Destaca experiência com "microservices"',
          'Menciona projetos relacionados com a vaga',
        ],
      };

      return res.status(200).json({
        success: true,
        data: {
          jobImportId: jobImport.id,
          adaptedContent,
        },
      });
    } catch (error) {
      console.error('Erro ao adaptar CV:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao adaptar CV para vaga',
      });
    }
  }


module.exports = AIController;