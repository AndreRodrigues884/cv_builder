<template>
  <div class="max-4-xl mx-auto">
  <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>←</span>
      Voltar
    </button>
    <!-- Seleção de CV e descrição -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
      <h2 class="text-2xl font-bold mb-4">Simulação de Entrevista com IA</h2>
      <p class="text-slate-400 mb-6">
        Gera perguntas personalizadas com base no teu CV e descrição da vaga.
      </p>

      <!-- Selecionar CV -->
      <select
        v-model="selectedCVId"
        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:border-purple-500 focus:outline-none transition-all"
        :disabled="aiStore.loading"
      >
        <option value="">Seleciona um CV</option>
        <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
      </select>

      <!-- Descrição da vaga -->
      <textarea
        v-model="jobDescription"
        class="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 focus:border-purple-500 focus:outline-none text-white placeholder-slate-500"
        rows="4"
        placeholder="(Opcional) Cola aqui a descrição da vaga..."
      ></textarea>

      <!-- Erro -->
      <div
        v-if="aiStore.error"
        class="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
      >
        {{ aiStore.error }}
      </div>

      <!-- Botão Gerar -->
      <button
        @click="generateInterview"
        :disabled="!selectedCVId || aiStore.loading"
        class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-xl hover:shadow-pink-500/30 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!aiStore.loading" class="text-xl">🤖</span>
        {{ aiStore.loading ? 'A gerar perguntas...' : 'Gerar Perguntas' }}
      </button>
    </div>

    <!-- Resultado -->
    <div
      v-if="interviewData && !aiStore.loading"
      class="bg-slate-900 border border-slate-800 rounded-2xl p-8"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold">Perguntas Geradas</h3>
        <span class="text-xs text-slate-500">{{ interviewData.totalQuestions }} perguntas</span>
      </div>

      <!-- Lista de perguntas -->
      <div class="space-y-4 mb-8">
        <div
          v-for="(question, index) in interviewData.questions"
          :key="index"
          class="bg-slate-800 border border-slate-700 rounded-lg p-5"
        >
          <div class="flex items-center justify-between mb-2">
            <span
              class="text-xs px-3 py-1 rounded-full font-medium bg-purple-600/20 text-purple-400"
            >
              {{ question.category }}
            </span>
            <span
              :class="getDifficultyClass(question.difficulty)"
              class="text-xs font-semibold"
            >
              {{ getDifficultyLabel(question.difficulty) }}
            </span>
          </div>
          <p class="text-white font-medium">{{ question.question }}</p>
          <p class="text-slate-400 text-sm mt-2">
            💡 Baseado em: {{ question.basedOn }}
          </p>
        </div>
      </div>

      <!-- Dicas -->
      <div
        v-if="interviewData.preparationTips.length"
        class="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-6 mb-6"
      >
        <h4 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span>📋</span> Dicas de Preparação
        </h4>
        <ul class="list-disc list-inside text-slate-300 text-sm space-y-2">
          <li v-for="(tip, index) in interviewData.preparationTips" :key="index">
            {{ tip }}
          </li>
        </ul>
      </div>

      <button
        @click="clearInterview"
        class="w-full py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all text-white font-medium"
      >
        Gerar Novas Perguntas
      </button>
    </div>

    <!-- Placeholder -->
    <div
      v-if="!interviewData && !aiStore.loading"
      class="text-slate-400 text-center mt-6"
    >
      Seleciona um CV acima e gera as tuas perguntas de entrevista.
    </div>
  </div>
</template>



<script>
import { useCVStore } from '../../stores/cv'
import { useAIStore } from '../../stores/ai'

export default {
  name: 'InterviewSimulator',

  data() {
    return {
      selectedCVId: '',
      jobDescription: '',
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

    interviewData() {
      return this.aiStore.currentQuestions
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
    async generateInterview() {
      if (!this.selectedCVId) {
        alert('Por favor, seleciona um CV primeiro.')
        return
      }

      try {
        await this.aiStore.generateInterviewQuestions(this.selectedCVId, this.jobDescription)
      } catch (error) {
        console.error('Erro ao gerar perguntas:', error)
      }
    },

    clearInterview() {
      this.aiStore.currentQuestions = null
      this.selectedCVId = ''
      this.jobDescription = ''
    },

    getDifficultyClass(level) {
      const map = {
        easy: 'text-green-400',
        medium: 'text-yellow-400',
        hard: 'text-red-400'
      }
      return map[level] || 'text-slate-400'
    },

    getDifficultyLabel(level) {
      const map = {
        easy: 'Fácil',
        medium: 'Média',
        hard: 'Difícil'
      }
      return map[level] || level
    }
  },

  beforeUnmount() {
    this.aiStore.clearError()
  }
}
</script>
