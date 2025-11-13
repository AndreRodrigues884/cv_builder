import { defineStore } from 'pinia'
import * as aiAPI from '../api/ai'
import {
  AIState,
  AIGenerateQuestionsResponse,
  AISuggestCareerPathData,
  AISuggestCareerPathResponse,
  GenerateSummaryRequest,
  ImproveTextRequest,
  ImproveExperienceRequest,
  SuggestSkillsRequest,
  OptimizeATSRequest
} from '../types/aiInterface'

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    currentReview: null,
    reviewHistory: [],
    currentQuestions: null,
    currentCareerSuggestion: null as AISuggestCareerPathData | null,
    currentSummary: null as string | null,
    currentSuggestions: [] as string[],
    optimizedCV: null as any,
    loading: false,
    error: null
  }),

  getters: {
    hasCurrentReview: (state) => state.currentReview !== null,
    overallScore: (state) => state.currentReview?.scores.overall || 0,
    sortedRecommendations: (state) => {
      if (!state.currentReview) return []
      const priorityOrder = { high: 1, medium: 2, low: 3 }
      return [...state.currentReview.recommendations].sort(
        (a, b) =>
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
      )
    },
    isLoading: (state) => state.loading
  },

  actions: {
    async analyzeCV(cvId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.reviewCV({ cvId })
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao analisar CV')

        const review = response.data.data.review
        this.currentReview = review

        const exists = this.reviewHistory.some((r) => r.id === review.id)
        if (!exists) this.reviewHistory.unshift(review)

        return review
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || 'Erro ao analisar CV'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async generateInterviewQuestions(cvId: string, jobDescription: string) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.generateInterviewQuestions({ cvId, jobDescription })
        const data = response.data as AIGenerateQuestionsResponse

        if (!data.success)
          throw new Error(data.message || 'Erro ao gerar perguntas')

        const { questions, totalQuestions, preparationTips } = data.data
        this.currentQuestions = { questions, totalQuestions, preparationTips }

        return this.currentQuestions
      } catch (error: any) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          'Erro ao gerar perguntas de entrevista'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async suggestCareerPath() {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.suggestCareerPath()
        const data = response.data as AISuggestCareerPathResponse

        if (!data.success)
          throw new Error(data.message || 'Erro ao sugerir caminhos de carreira')

        this.currentCareerSuggestion = data.data
        return this.currentCareerSuggestion
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || 'Erro ao sugerir carreira'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async generateSummary(payload: GenerateSummaryRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.generateSummary(payload)
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao gerar resumo')
        this.currentSummary = response.data.data.summary
        return this.currentSummary
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || 'Erro ao gerar resumo'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async improveText(payload: ImproveTextRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.improveText(payload)
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao melhorar texto')
        return response.data.data.improvedText
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || 'Erro ao melhorar texto'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async improveExperience(payload: ImproveExperienceRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.improveExperience(payload)
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao melhorar experiência')
        return response.data.data.improvedText
      } catch (error: any) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          'Erro ao melhorar experiência'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async suggestSkills(payload: SuggestSkillsRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.suggestSkills(payload)
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao sugerir skills')
        this.currentSuggestions = response.data.data.skills
        return this.currentSuggestions
      } catch (error: any) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          'Erro ao sugerir skills'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    async optimizeForATS(payload: OptimizeATSRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await aiAPI.optimizeForATS(payload)
        if (!response.data.success)
          throw new Error(response.data.message || 'Erro ao otimizar CV')
        this.optimizedCV = response.data.data.optimized
        return this.optimizedCV
      } catch (error: any) {
        const msg =
          error.response?.data?.message || error.message || 'Erro ao otimizar CV'
        this.error = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    },

    clearAll() {
      this.currentReview = null
      this.currentQuestions = null
      this.currentCareerSuggestion = null
      this.currentSummary = null
      this.currentSuggestions = []
      this.optimizedCV = null
      this.error = null
    }
  }
})

export default useAIStore
