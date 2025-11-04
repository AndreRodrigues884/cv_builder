export interface AIReviewRequest {
  cvId: string
}

export interface AIReviewScores {
  overall: number
  ats: number
  language: number
  impact: number
  clarity: number
}

export interface AIRecommendation {
  type: string
  message: string
  section: string
  priority: string
}

export interface AIReviewData {
  id: string
  scores: AIReviewScores
  recommendations: AIRecommendation[]
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  estimatedReadTime: number
  createdAt: string
}

export interface AIReviewResponse {
  success: boolean
  message: string
  data: {
    review: AIReviewData
  }
}

export interface AIReviewHistoryResponse {
  success: boolean
  data: {
    reviews: AIReviewData[]
  }
}

export interface AIState {
  currentReview: AIReviewData | null
  reviewHistory: AIReviewData[]
  currentQuestions: AIInterviewQuestionsData | null
  loading: boolean
  error: string | null
  currentCareerSuggestion: AISuggestCareerPathData | null
}

export interface AIInterviewQuestion {
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  basedOn: string
}

// Requisição ao endpoint
export interface AIGenerateQuestionsRequest {
  cvId: string
  jobDescription: string
}

export interface AIInterviewQuestionsData {
  questions: AIInterviewQuestion[]
  totalQuestions: number
  preparationTips: string[]
}

// Resposta do endpoint
export interface AIGenerateQuestionsResponse {
  success: boolean
  data: {
    questions: AIInterviewQuestion[]
    totalQuestions: number
    preparationTips: string[]
  }
  message?: string
}

export interface AISuggestCareerPathData {
  currentRole: string
  suggestedPaths: {
    role: string
    timeline: string
    probability: string
    requirements: string[]
    salary: string
  }[]
  insights: string[]
}

export interface AISuggestCareerPathResponse {
  success: boolean
  data: AISuggestCareerPathData
  message?: string
}

export interface AIAnalyzeSkillGapsRequest {
  targetRole: string
  targetCompany?: string
}

// Cada sugestão de skill
export interface AISkillGapSuggestion {
  skill: string
  category: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

// Dados retornados pelo endpoint
export interface AIAnalyzeSkillGapsData {
  suggestions: AISkillGapSuggestion[]
  currentSkills: string[]  // skills que o usuário já possui
}

// Response padrão da API
export interface AIAnalyzeSkillGapsResponse {
  success: boolean
  message?: string
  data: AIAnalyzeSkillGapsData
}