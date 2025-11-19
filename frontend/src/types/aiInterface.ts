// ============================================
// SCORES E REVIEW
// ============================================

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

// ============================================
// STATE DA STORE
// ============================================

export interface AIState {
  currentReview: AIReviewData | null
  reviewHistory: AIReviewData[]
  currentQuestions: AIInterviewQuestionsData | null
  currentCareerSuggestion: AISuggestCareerPathData | null
  currentSummary: string | null
  currentSuggestions: string[]
  optimizedCV: AIOptimizedCVData | null // ✅ Tipado corretamente
  loading: boolean
  error: string | null
}

// ============================================
// INTERVIEW QUESTIONS
// ============================================

export interface AIInterviewQuestion {
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  basedOn: string
}

export interface AIInterviewQuestionsData {
  questions: AIInterviewQuestion[]
  totalQuestions: number
  preparationTips: string[]
}

export interface AIGenerateQuestionsResponse {
  success: boolean
  data: {
    questions: AIInterviewQuestion[]
    totalQuestions: number
    preparationTips: string[]
  }
  message?: string
}

// ============================================
// CAREER PATH
// ============================================

export interface AICareerPathSuggestion {
  role: string
  timeline: string
  probability: string
  requirements: string[]
  salary: string
}

export interface AISuggestCareerPathData {
  currentRole: string
  suggestedPaths: AICareerPathSuggestion[]
  insights: string[]
}

export interface AISuggestCareerPathResponse {
  success: boolean
  data: AISuggestCareerPathData
  message?: string
}

// ============================================
// SKILL GAPS
// ============================================

export interface AISkillGapSuggestion {
  skill: string
  category: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

export interface AIAnalyzeSkillGapsData {
  suggestions: AISkillGapSuggestion[]
  currentSkills: string[]
}

export interface AIAnalyzeSkillGapsResponse {
  success: boolean
  data: AIAnalyzeSkillGapsData
  message?: string
}

// ============================================
// IMPROVE TEXT
// ============================================

export interface ImproveTextRequest {
  text: string
  section?: string // ✅ Adicionado
  context?: string
}

export interface ImproveTextResponse {
  success: boolean
  data: {
    original: string
    improved: string // ✅ Corresponde ao backend
    suggestions?: string[]
  }
  message?: string
}

// ============================================
// IMPROVE EXPERIENCE
// ============================================

export interface ImproveExperienceRequest {
  description: string
  jobTitle: string
  company: string
}

export interface ImproveExperienceResponse {
  success: boolean
  data: {
    improved: string // ✅ Corresponde ao backend
  }
  message?: string
}

// ============================================
// SUGGEST SKILLS
// ============================================

export interface SuggestSkillsRequest {
  jobTitle: string
  jobArea?: string
}

export interface SuggestSkillsResponse {
  success: boolean
  data: {
    suggestions: string[] // ✅ Backend retorna "suggestions" não "skills"
    currentSkills: string[]
  }
  message?: string
}

// ============================================
// GENERATE SUMMARY
// ============================================

export interface GenerateSummaryRequest {
  jobTitle: string // ✅ Alinhado com backend
  targetArea?: string // ✅ Alinhado com backend
  tone?: string // ✅ Alinhado com backend
}

export interface GenerateSummaryResponse {
  success: boolean
  data: {
    summary: string
    variations?: string[]
    tips?: string[]
  }
  message?: string
}

// ============================================
// OPTIMIZE ATS
// ============================================

export interface OptimizeATSRequest {
  cvId: string
  jobDescription?: string
}

export interface AIOptimizedCVData {
  optimizations: any[] // ✅ Estrutura correta do backend
  atsScore: number
  improvements: string[]
}

export interface OptimizeATSResponse {
  success: boolean
  data: {
    optimizations: any[]
    atsScore: number
    maxScore: number
    improvements: string[]
  }
  message?: string
}

// ============================================
// REVIEW CV
// ============================================

export interface ReviewCVRequest {
  cvId: string
}

export interface ReviewCVResponse {
  success: boolean
  data: {
    review: AIReviewData
  }
  message?: string
}

// ============================================
// GENERATE INTERVIEW QUESTIONS
// ============================================

export interface GenerateQuestionsRequest {
  cvId: string
  jobDescription: string
}

// ============================================
// GENERIC API RESPONSE
// ============================================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
}