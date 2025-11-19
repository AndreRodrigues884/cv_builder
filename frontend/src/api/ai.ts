import api from '../services/axios'
import { GenerateQuestionsRequest, GenerateSummaryRequest, ImproveExperienceRequest, ImproveTextRequest, OptimizeATSRequest, ReviewCVRequest, SuggestSkillsRequest } from '../types/aiInterface'

const BASE_URL = '/ai'

/**
 * Gerar resumo profissional
 * POST /ai/generate-summary
 */
export const generateSummary = (data: GenerateSummaryRequest) =>
  api.post(`${BASE_URL}/generate-summary`, data)

/**
 * Melhorar texto genérico
 * POST /ai/improve-text
 */
export const improveText = (data: ImproveTextRequest) =>
  api.post(`${BASE_URL}/improve-text`, data)

/**
 * Melhorar descrição de experiência (usa improve-text)
 * POST /ai/improve-text
 */
export const improveExperience = (data: ImproveExperienceRequest) =>
  api.post(`${BASE_URL}/improve-text`, {
    text: data.description,
    section: 'experience', // ← Adicionar section
    context: `Cargo: ${data.jobTitle} na empresa ${data.company}`
  })

/**
 * Sugerir skills baseado no cargo
 * POST /ai/suggest-skills
 */
export const suggestSkills = (data: SuggestSkillsRequest) =>
  api.post(`${BASE_URL}/suggest-skills`, data)

/**
 * Otimizar CV para ATS
 * POST /ai/optimize-ats
 */
export const optimizeForATS = (data: OptimizeATSRequest) =>
  api.post(`${BASE_URL}/optimize-ats`, data)

/**
 * Analisar CV completo (review)
 * POST /ai/review (corrigido)
 */
export const reviewCV = (data: ReviewCVRequest) =>
  api.post(`${BASE_URL}/review`, data)

/**
 * Gerar perguntas de entrevista
 * POST /ai/interview-questions
 */
export const generateInterviewQuestions = (data: GenerateQuestionsRequest) =>
  api.post(`${BASE_URL}/interview-questions`, data)

/**
 * Sugerir caminho de carreira
 * POST /ai/career-path (corrigido)
 */
export const suggestCareerPath = () =>
  api.post(`${BASE_URL}/career-path`)