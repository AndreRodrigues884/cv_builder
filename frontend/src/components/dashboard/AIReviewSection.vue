<template>
  <div v-if="activeSection === 'ai-review'" class="max-w-5xl mx-auto">
    <!-- Seleção do CV -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
      <h2 class="text-2xl font-bold mb-4">Analisar CV com IA</h2>
      <p class="text-slate-400 mb-6">
        Seleciona um CV para análise detalhada com pontuação ATS, linguagem, impacto e clareza
      </p>

      <select
        v-model="selectedCVId"
        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:border-blue-500 focus:outline-none transition-all"
        :disabled="aiStore.isLoading"
      >
        <option value="">Seleciona um CV</option>
        <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
      </select>

      <!-- Mensagem de erro -->
      <div v-if="aiStore.error" class="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
        {{ aiStore.error }}
      </div>

      <button
        @click="analyzeCV"
        :disabled="!selectedCVId || aiStore.isLoading"
        class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-xl">🎯</span>
        {{ aiStore.isLoading ? 'A analisar...' : 'Analisar com IA' }}
      </button>
    </div>

    <!-- Resultados da análise -->
    <div v-if="currentReview" class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">Resultado da Análise</h3>
        <span class="text-xs text-slate-500">
          {{ formatDate(currentReview.createdAt) }}
        </span>
      </div>

      <!-- Score Geral -->
      <div
        class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 mb-6"
      >
        <div class="text-center mb-4">
          <div
            class="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            {{ currentReview.scores.overall }}
          </div>
          <div class="text-slate-400">Score Geral</div>
        </div>
        <div class="text-center text-sm text-slate-500">
          Tempo estimado de leitura: {{ currentReview.estimatedReadTime }}s
        </div>
      </div>

      <!-- Scores Detalhados -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-green-500 mb-1">{{ currentReview.scores.ats }}</div>
          <div class="text-xs text-slate-400">ATS</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-blue-500 mb-1">{{ currentReview.scores.language }}</div>
          <div class="text-xs text-slate-400">Linguagem</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-purple-500 mb-1">{{ currentReview.scores.impact }}</div>
          <div class="text-xs text-slate-400">Impacto</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-cyan-500 mb-1">{{ currentReview.scores.clarity }}</div>
          <div class="text-xs text-slate-400">Clareza</div>
        </div>
      </div>

      <!-- Pontos Fortes -->
      <div v-if="currentReview.strengths.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>✅</span> Pontos Fortes
        </h4>
        <div class="space-y-2">
          <div
            v-for="(strength, index) in currentReview.strengths"
            :key="index"
            class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400"
          >
            {{ strength }}
          </div>
        </div>
      </div>

      <!-- Recomendações -->
      <div v-if="currentReview.recommendations.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">Recomendações</h4>
        <div class="space-y-3">
          <div
            v-for="(rec, index) in currentReview.recommendations"
            :key="index"
            :class="[
              'rounded-lg p-4 border',
              getPriorityClass(rec.priority)
            ]"
          >
            <div class="flex items-start gap-3">
              <span class="text-xl">{{ getPriorityIcon(rec.priority) }}</span>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold">{{ rec.message }}</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                    {{ rec.section }}
                  </span>
                </div>
                <span
                  :class="[
                    'text-xs px-2 py-1 rounded inline-block',
                    getPriorityBadgeClass(rec.priority)
                  ]"
                >
                  Prioridade: {{ rec.priority }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pontos de Melhoria -->
      <div v-if="currentReview.improvements.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>💡</span> Áreas de Melhoria
        </h4>
        <div class="space-y-2">
          <div
            v-for="(improvement, index) in currentReview.improvements"
            :key="index"
            class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400"
          >
            {{ improvement }}
          </div>
        </div>
      </div>

      <!-- Keywords em Falta -->
      <div v-if="currentReview.missingKeywords.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>🔑</span> Keywords Sugeridas
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(keyword, index) in currentReview.missingKeywords"
            :key="index"
            class="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-sm text-orange-400"
          >
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há análise -->
    <div v-if="!currentReview && !aiStore.isLoading" class="text-slate-400 text-center mt-4">
      Seleciona um CV acima para ver a análise
    </div>
  </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'
import { useAIStore } from '../../stores/ai'

export default {
  name: 'AiReview',

  data() {
    return {
      selectedCVId: '',
      cvStore: null,
      aiStore: null
    }
  },

  created() {
    this.cvStore = useCVStore()
    this.aiStore = useAIStore()
  },

  async mounted() {
    if (!this.cvStore.cvs.length) {
      await this.cvStore.fetchCVs()
    }
  },

  computed: {
    allCVs() {
      return this.cvStore.allCVs
    },

    currentReview() {
      return this.aiStore.currentReview
    },

    activeSection: {
      get() {
        return this.$parent.activeSection
      },
      set(value) {
        this.$parent.activeSection = value
      }
    }
  },

  methods: {
    async analyzeCV() {
      if (!this.selectedCVId) {
        alert('Escolhe um CV primeiro!')
        return
      }

      try {
        await this.aiStore.analyzeCV(this.selectedCVId)
      } catch (error) {
        console.error('Erro ao analisar CV:', error)
      }
    },

    getPriorityClass(priority) {
      const classes = {
        high: 'bg-red-500/10 border-red-500/30',
        medium: 'bg-orange-500/10 border-orange-500/30',
        low: 'bg-blue-500/10 border-blue-500/30'
      }
      return classes[priority] || classes.low
    },

    getPriorityBadgeClass(priority) {
      const classes = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-orange-500/20 text-orange-400',
        low: 'bg-blue-500/20 text-blue-400'
      }
      return classes[priority] || classes.low
    },

    getPriorityIcon(priority) {
      const icons = {
        high: '⚠️',
        medium: '💡',
        low: 'ℹ️'
      }
      return icons[priority] || icons.low
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },

  beforeUnmount() {
    // Limpa a análise atual quando sai da view
    this.aiStore.clearError()
  }
}
</script>