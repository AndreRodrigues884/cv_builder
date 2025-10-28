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
      >
        <option value="">Seleciona um CV</option>
        <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
      </select>

      <button
        @click="analyzeCV"
        :disabled="loading"
        class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold flex items-center justify-center gap-2"
      >
        <span class="text-xl">🎯</span>
        {{ loading ? 'A analisar...' : 'Analisar com IA' }}
      </button>
    </div>

    <!-- Resultados da análise -->
    <div v-if="analysisResult" class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h3 class="text-xl font-bold mb-6">Resultado da Análise</h3>

      <!-- Score Geral -->
      <div
        class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 mb-6"
      >
        <div class="text-center mb-4">
          <div
            class="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            {{ analysisResult.overallScore }}
          </div>
          <div class="text-slate-400">Score Geral</div>
        </div>
      </div>

      <!-- Scores Detalhados -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-green-500 mb-1">{{ analysisResult.ats }}</div>
          <div class="text-xs text-slate-400">ATS</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-blue-500 mb-1">{{ analysisResult.language }}</div>
          <div class="text-xs text-slate-400">Linguagem</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-purple-500 mb-1">{{ analysisResult.impact }}</div>
          <div class="text-xs text-slate-400">Impacto</div>
        </div>
        <div class="bg-slate-800 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-cyan-500 mb-1">{{ analysisResult.clarity }}</div>
          <div class="text-xs text-slate-400">Clareza</div>
        </div>
      </div>

      <!-- Recomendações -->
      <div class="space-y-4">
        <div
          v-for="(rec, index) in analysisResult.recommendations"
          :key="index"
          :class="`bg-slate-800 border border-${rec.color}-500/30 rounded-lg p-4`"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl">{{ rec.icon }}</span>
            <div class="flex-1">
              <div class="font-semibold mb-1">{{ rec.title }}</div>
              <p class="text-sm text-slate-400">{{ rec.description }}</p>
            </div>
            <span
              class="text-xs px-2 py-1 rounded"
              :class="`bg-${rec.color}-500/20 text-${rec.color}-400`"
              >{{ rec.level }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há CV selecionado -->
    <div v-if="!analysisResult && !loading" class="text-slate-400 text-center mt-4">
      Seleciona um CV acima para ver a análise
    </div>
  </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'

export default {
  name: 'AiReview',

  data() {
    return {
      selectedCVId: '',
      analysisResult: null,
      loading: false,
      error: null,
      cvStore: null, // ← adiciona isto
    }
  },

  created() {
    this.cvStore = useCVStore() // ← inicializa aqui
  },

  async mounted() {
    if (!this.cvStore.cvs.length) {
      await this.cvStore.fetchCVs()
    }
  },

  computed: {
    allCVs() {
      return this.cvStore.allCVs;
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

      this.loading = true
      this.error = null
      this.analysisResult = null

      try {
        await new Promise(r => setTimeout(r, 1000)) // simulação de API

        this.analysisResult = {
          overallScore: 85,
          ats: 92,
          language: 78,
          impact: 88,
          clarity: 82,
          recommendations: [
            {
              level: 'Alta',
              title: 'Adiciona números e resultados',
              description: 'As tuas experiências ganhariam mais impacto com métricas quantificáveis',
              icon: '⚠️',
              color: 'orange'
            },
            {
              level: 'Média',
              title: 'Usa verbos de ação',
              description:
                'Substitui frases passivas por verbos impactantes: Desenvolvi, Implementei, Liderei',
              icon: '💡',
              color: 'blue'
            },
            {
              level: 'Info',
              title: 'Ponto forte',
              description: 'Excelente estrutura e organização das competências técnicas',
              icon: '✅',
              color: 'green'
            }
          ]
        }
      } catch (err) {
        console.error('Erro ao analisar CV:', err)
        this.error = 'Erro ao analisar CV'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
