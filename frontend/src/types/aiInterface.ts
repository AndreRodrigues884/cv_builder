

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


export interface AIState {
  currentReview: AIReviewData | null
  reviewHistory: AIReviewData[]
  currentQuestions: AIInterviewQuestionsData | null
  currentCareerSuggestion: AISuggestCareerPathData | null
  currentSummary: string | null
  currentSuggestions: string[]
  optimizedCV: any
  loading: boolean
  error: string | null
}

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

export interface ImproveExperienceRequest {
  description: string
  jobTitle: string
  company: string
}

export interface SuggestSkillsRequest {
  jobTitle: string
  jobArea?: string
}

export interface GenerateSummaryRequest {
  name: string
  targetRole: string
  experiences: any[]
  skills: any[]
}

export interface ReviewCVRequest {
  cvId: string
}

export interface ImproveExperienceRequest {
  description: string
  jobTitle: string
  company: string
}

export interface SuggestSkillsRequest {
  jobTitle: string
  jobArea?: string
}

export interface GenerateSummaryRequest {
  name: string
  targetRole: string
  experiences: any[]
  skills: any[]
}

export interface ImproveTextRequest {
  text: string
  context?: string
}

export interface OptimizeATSRequest {
  cvId: string
  jobDescription?: string
}


export interface GenerateQuestionsRequest {
  cvId: string
  jobDescription: string
}
