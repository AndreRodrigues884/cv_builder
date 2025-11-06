import { PrismaClient } from '@prisma/client';
import aiService from '../services/ai.services.js';

const prisma = new PrismaClient();

/**
 * Importar descrição de vaga
 * POST /api/jobs/import
 */
export const importJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sourceUrl, jobDescription } = req.body;

    // Extrair competências e keywords da vaga com IA
    const analysis = await aiService.analyzeJobDescription(jobDescription);

    const jobImport = await prisma.jobImport.create({
      data: {
        userId,
        sourceUrl: sourceUrl || null,
        parsedText: jobDescription,
        extractedSkills: analysis.skills || [],
        extractedKeywords: analysis.keywords || [],
        jobTitle: analysis.jobTitle || 'Sem título',
        company: analysis.company || null,
        location: analysis.location || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Vaga importada com sucesso',
      data: { jobImport },
    });
  } catch (error) {
    console.error('Erro ao importar vaga:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao importar vaga',
    });
  }
};

/**
 * Adaptar CV para vaga específica
 * POST /api/jobs/match-cv
 */
export const matchCVToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cvId, jobImportId } = req.body;

    // Buscar CV
    const cv = await prisma.cV.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Buscar vaga
    const job = await prisma.jobImport.findFirst({
      where: { id: jobImportId, userId },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada',
      });
    }

    // Adaptar CV com IA
    const adaptedContent = await aiService.adaptCVToJob(
      cv.contentJson,
      job.parsedText,
      job.extractedSkills
    );

    // Criar novo CV adaptado
    const adaptedCV = await prisma.cV.create({
      data: {
        userId,
        title: `${cv.title} - ${job.jobTitle}`,
        targetRole: job.jobTitle,
        content: adaptedContent,
        templateId: cv.templateId,
        status: 'DRAFT',
        language: cv.language,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'CV adaptado com sucesso',
      data: {
        adaptedCV,
        missingSkills: adaptedContent.missingSkills || [],
        matchScore: adaptedContent.matchScore || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao adaptar CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adaptar CV',
    });
  }
};

/**
 * Analisar compatibilidade CV x Vaga
 * POST /api/jobs/analyze-match
 */
export const analyzeMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cvId, jobDescription } = req.body;

    const cv = await prisma.cV.findFirst({
      where: { id: cvId, userId },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV não encontrado',
      });
    }

    // Análise de compatibilidade com IA
    const matchAnalysis = await aiService.analyzeJobMatch(
      cv.contentJson,
      jobDescription
    );

    return res.status(200).json({
      success: true,
      data: {
        matchScore: matchAnalysis.score,
        matchingSkills: matchAnalysis.matchingSkills,
        missingSkills: matchAnalysis.missingSkills,
        recommendations: matchAnalysis.recommendations,
        strengths: matchAnalysis.strengths,
        gaps: matchAnalysis.gaps,
      },
    });
  } catch (error) {
    console.error('Erro ao analisar compatibilidade:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao analisar compatibilidade',
    });
  }
};

/**
 * Listar vagas importadas
 * GET /api/jobs/my-imports
 */
export const getMyJobImports = async (req, res) => {
  try {
    const userId = req.user.id;

    const imports = await prisma.jobImport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      data: { imports },
    });
  } catch (error) {
    console.error('Erro ao listar importações:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar importações',
    });
  }
};

/**
 * Apagar importação de vaga
 * DELETE /api/jobs/:id
 */
export const deleteJobImport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const jobImport = await prisma.jobImport.findFirst({
      where: { id, userId },
    });

    if (!jobImport) {
      return res.status(404).json({
        success: false,
        message: 'Importação não encontrada',
      });
    }

    await prisma.jobImport.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Importação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao apagar importação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao apagar importação',
    });
  }
};