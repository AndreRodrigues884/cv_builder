import api from '../services/axios'
import { AIAnalyzeSkillGapsRequest, AIAnalyzeSkillGapsResponse, AIGenerateQuestionsRequest, AIGenerateQuestionsResponse, AIReviewRequest, AIReviewResponse } from '../types/aiInterface'

const BASE_URL = '/ai'

export const reviewCV = (data: AIReviewRequest) =>
  api.post<AIReviewResponse>(`${BASE_URL}/review-cv`, data)

export const generateInterviewQuestions = (data: AIGenerateQuestionsRequest) =>
  api.post<AIGenerateQuestionsResponse>(`${BASE_URL}/interview-questions`, data)

export const suggestCareerPath = async () => {
  return await api.post(`${BASE_URL}/suggest-career-path`, {})
}

export const analyzeSkillGaps = (data: AIAnalyzeSkillGapsRequest) =>
  api.post<AIAnalyzeSkillGapsResponse>(`${BASE_URL}/suggest-skills`, data)
