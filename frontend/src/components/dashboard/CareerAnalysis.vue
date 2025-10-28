<template>
  <div class="max-w-4xl mx-auto">
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>←</span>
      Voltar
    </button>

    <div class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-8 mb-6">
      <h1 class="text-3xl font-bold mb-2">📈 Análise de Carreira</h1>
      <p class="text-slate-400">Caminhos recomendados para a tua progressão profissional</p>
    </div>

    <!-- Loading State -->
    <div v-if="!careerData" class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
      <div class="text-4xl mb-4">📈</div>
      <p class="text-slate-400 mb-6">A IA vai analisar o teu perfil e sugerir os melhores caminhos de carreira</p>
      <button
        @click="analyzeCareer"
        :disabled="loading"
        class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
      >
        <span v-if="loading">A analisar...</span>
        <span v-else>📈 Analisar Carreira</span>
      </button>
    </div>

    <!-- Results -->
    <div v-else class="space-y-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-sm text-slate-400 mb-2">Cargo Atual</h3>
        <p class="text-2xl font-bold text-blue-400">{{ careerData.currentRole }}</p>
      </div>

      <h3 class="text-lg font-bold mt-6 mb-3">🎯 Caminhos Sugeridos</h3>
      <div
        v-for="(path, idx) in careerData.suggestedPaths"
        :key="idx"
        class="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="text-xl font-bold mb-1">{{ path.role }}</h4>
            <p class="text-sm text-slate-400">Timeline: {{ path.timeframe }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-blue-400">{{ path.probability }}%</div>
            <div class="text-xs text-slate-400">Probabilidade</div>
          </div>
        </div>
        <div class="bg-slate-800/50 rounded-lg p-4">
          <p class="text-sm font-medium mb-2">Requisitos:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(req, i) in path.requirements"
              :key="i"
              class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
            >
              {{ req }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
        <h3 class="font-bold mb-3">💡 Insights da IA</h3>
        <ul class="space-y-2">
          <li
            v-for="(insight, idx) in careerData.insights"
            :key="idx"
            class="flex items-start gap-2 text-sm text-slate-300"
          >
            <span class="text-purple-400 mt-0.5">✨</span>
            {{ insight }}
          </li>
        </ul>
      </div>

      <button
        @click="careerData = null"
        class="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all"
      >
        Analisar Novamente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineEmits(['back']);

const loading = ref(false);
const careerData = ref(null);

const analyzeCareer = () => {
  loading.value = true;

  // Simula delay de análise
  setTimeout(() => {
    careerData.value = {
      currentRole: 'Desenvolvedor Front-end',
      suggestedPaths: [
        {
          role: 'Senior Front-end Developer',
          timeframe: '12-18 meses',
          probability: 85,
          requirements: ['React Avançado', 'TypeScript', 'Testes Unitários']
        },
        {
          role: 'Full Stack Developer',
          timeframe: '18-24 meses',
          probability: 70,
          requirements: ['Node.js', 'React', 'Banco de Dados']
        },
        {
          role: 'Team Lead',
          timeframe: '24-36 meses',
          probability: 60,
          requirements: ['Gestão de equipe', 'Mentoria', 'Planejamento']
        }
      ],
      insights: [
        'Focar em aprofundar conhecimentos em React e TypeScript.',
        'Praticar projetos full-stack para ganhar experiência em backend.',
        'Participar de workshops e cursos de liderança para preparação de cargos seniores.'
      ]
    };

    loading.value = false;
  }, 1200); // delay simulado de 1.2s
};
</script>
