import { defineStore } from 'pinia'
import * as aiAPI from '../api/ai'
import { AIGenerateQuestionsResponse, AIInterviewQuestionsData, AIState, AISuggestCareerPathData, AISuggestCareerPathResponse } from '../types/aiInterface'

export const useAIStore = defineStore('ai', {
    state: (): AIState => ({
        currentReview: null,
        reviewHistory: [],
        currentQuestions: null,
        currentCareerSuggestion: null as AISuggestCareerPathData | null,
        loading: false,
        error: null
    }),

    getters: {
        hasCurrentReview: (state) => state.currentReview !== null,
        overallScore: (state) => state.currentReview?.scores.overall || 0,
        highPriorityRecommendations: (state) => {
            return state.currentReview?.recommendations.filter(
                rec => rec.priority === 'high'
            ) || []
        },
        sortedRecommendations: (state) => {
            if (!state.currentReview) return []

            const priorityOrder = { high: 1, medium: 2, low: 3 }
            return [...state.currentReview.recommendations].sort((a, b) => {
                return priorityOrder[a.priority as keyof typeof priorityOrder] -
                    priorityOrder[b.priority as keyof typeof priorityOrder]
            })
        },
        isLoading: (state) => state.loading
    },

    actions: {
        async analyzeCV(cvId: string) {
            this.loading = true
            this.error = null

            try {
                const response = await aiAPI.reviewCV({ cvId })

                if (!response.data.success) {
                    throw new Error(response.data.message || 'Erro ao analisar CV')
                }

                const review = response.data.data.review
                this.currentReview = review

                // Adiciona ao histórico se não existir
                const existsInHistory = this.reviewHistory.some(r => r.id === review.id)
                if (!existsInHistory) {
                    this.reviewHistory.unshift(review)
                }

                return review
            } catch (error: any) {
                const errorMessage = error.response?.data?.message ||
                    error.message ||
                    'Erro ao analisar CV'
                this.error = errorMessage
                throw new Error(errorMessage)
            } finally {
                this.loading = false
            }
        },
        clearCurrentReview() {
            this.currentReview = null
            this.error = null
        },

        clearHistory() {
            this.reviewHistory = []
        },

        clearError() {
            this.error = null
        },

        async generateInterviewQuestions(cvId: string, jobDescription: string): Promise<AIInterviewQuestionsData> {
            this.loading = true
            this.error = null

            try {
                const response = await aiAPI.generateInterviewQuestions({ cvId, jobDescription })
                const data = response.data as AIGenerateQuestionsResponse

                if (!data.success) {
                    throw new Error(data.message || 'Erro ao gerar perguntas')
                }

                const { questions, totalQuestions, preparationTips } = data.data

                this.currentQuestions = { questions, totalQuestions, preparationTips }

                return this.currentQuestions
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    'Erro ao gerar perguntas de entrevista'
                this.error = errorMessage
                throw new Error(errorMessage)
            } finally {
                this.loading = false
            }
        },

        async suggestCareerPath() {
            this.loading = true
            this.error = null

            try {
                const response = await aiAPI.suggestCareerPath()
                const { data } = response

                if (!data.success) {
                    throw new Error(data.message || 'Erro ao sugerir caminhos de carreira')
                }

                this.currentCareerSuggestion = data.data
                return this.currentCareerSuggestion
            } catch (error: unknown) {
                const err = error as any
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Erro ao sugerir carreira'
                this.error = message
                throw new Error(message)
            } finally {
                this.loading = false
            }
        },
        async analyzeSkillGaps(targetRole: string, targetCompany?: string) {
            this.loading = true
            this.error = null

            try {
                const response = await aiAPI.analyzeSkillGaps({ targetRole, targetCompany })
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Erro ao analisar lacunas de skills')
                }

                // Retornamos diretamente os dados da API
                return response.data.data
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    'Erro ao analisar lacunas de skills'
                this.error = errorMessage
                throw new Error(errorMessage)
            } finally {
                this.loading = false
            }
        },

    }
})

export default useAIStore