<template>
  <div class="max-w-4xl mx-auto">
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>←</span>
      Voltar
    </button>

    <div class="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-8 mb-6">
      <h1 class="text-3xl font-bold mb-2">🎯 Lacunas de Competências</h1>
      <p class="text-slate-400">Identifica as skills que precisas desenvolver</p>
    </div>

    <!-- Form -->
    <div v-if="!skillGapsData" class="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Cargo Desejado</label>
        <input
          v-model="targetRole"
          type="text"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          placeholder="Ex: Senior Full Stack Developer"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Empresa Alvo (opcional)</label>
        <input
          v-model="targetCompany"
          type="text"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          placeholder="Ex: Google, Microsoft..."
        />
      </div>

      <button
        @click="analyzeGaps"
        :disabled="loading || !targetRole"
        class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">A analisar...</span>
        <span v-else>🎯 Analisar Lacunas</span>
      </button>

      <p v-if="error" class="text-red-400 mt-4">{{ error }}</p>
    </div>

    <!-- Results -->
    <div v-else class="space-y-4">
      <div
        v-for="(gap, idx) in skillGapsData.suggestions"
        :key="idx"
        class="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold mb-1">{{ gap.skill }}</h3>
            <p class="text-sm text-slate-400">Categoria: {{ gap.category }}</p>
            <p class="text-sm text-slate-400">Motivo: {{ gap.reason }}</p>
          </div>
          <span
            :class="{
              'bg-red-600/20 text-red-400': gap.priority === 'high',
              'bg-yellow-600/20 text-yellow-400': gap.priority === 'medium',
              'bg-green-600/20 text-green-400': gap.priority === 'low'
            }"
            class="px-3 py-1 rounded-full text-xs font-semibold"
          >
            Prioridade {{ gap.priority }}
          </span>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
        <h3 class="font-bold mb-3">🚀 Ações Prioritárias</h3>
        <ul class="space-y-2">
          <li
            v-for="(action, idx) in skillGapsData.priorityActions"
            :key="idx"
            class="flex items-start gap-2 text-sm text-slate-300"
          >
            <span class="text-purple-400 mt-0.5">✓</span>
            {{ action }}
          </li>
        </ul>
      </div>

      <button
        @click="$emit('navigate', 'courses')"
        class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        📚 Ver Cursos Recomendados
      </button>
    </div>
  </div>
</template>

<script>
import { useAIStore } from '../../stores/ai'

export default {
  name: 'SkillGaps',
  emits: ['back', 'navigate'],
  data() {
    return {
      targetRole: '',
      targetCompany: '',
      loading: false,
      error: null,
      skillGapsData: null,
      aiStore: null
    }
  },
  created() {
    this.aiStore = useAIStore()
  },
  methods: {
    async analyzeGaps() {
      if (!this.targetRole) return

      this.loading = true
      this.error = null

      try {
        const data = await this.aiStore.analyzeSkillGaps({
          targetRole: this.targetRole,
          targetCompany: this.targetCompany || undefined
        })

        this.skillGapsData = data
      } catch (err) {
        console.error('Erro ao analisar lacunas:', err)
        this.error = err.message || 'Erro desconhecido'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
