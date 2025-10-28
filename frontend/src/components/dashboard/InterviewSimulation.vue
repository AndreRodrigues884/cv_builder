<template>
  <div class="max-w-4xl mx-auto">
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>←</span>
      Voltar
    </button>

    <div class="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
      <h1 class="text-3xl font-bold mb-2">💬 Simulação de Entrevista</h1>
      <p class="text-slate-400">Pratica com perguntas personalizadas geradas pela IA</p>
    </div>

    <!-- Form -->
    <div v-if="!interviewData" class="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Seleciona o CV</label>
        <select
          v-model="selectedCvId"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">Seleciona um CV</option>
          <option v-for="cv in cvs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
        </select>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Descrição da Vaga (opcional)</label>
        <textarea
          v-model="jobDescription"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          rows="4"
          placeholder="Cola aqui a descrição da vaga para perguntas mais específicas..."
        />
      </div>

      <button
        @click="generateQuestions"
        class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
      >
        ✨ Gerar Perguntas
      </button>
    </div>

    <!-- Results -->
    <div v-else class="space-y-4">
      <div
        v-for="(question, idx) in interviewData.questions"
        :key="idx"
        class="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-semibold">
            {{ question.category }}
          </span>
          <span
            :class="{
              'text-red-400': question.difficulty === 'Alta',
              'text-yellow-400': question.difficulty === 'Média',
              'text-green-400': question.difficulty === 'Fácil'
            }"
            class="text-xs font-medium"
          >
            {{ question.difficulty }}
          </span>
        </div>
        <h3 class="text-lg font-semibold mb-3">{{ question.question }}</h3>
        <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <p class="text-sm text-slate-400">💡 Dica: {{ question.tips }}</p>
        </div>
      </div>

      <div class="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-6">
        <h3 class="font-bold mb-3">📋 Dicas de Preparação</h3>
        <ul class="space-y-2">
          <li
            v-for="(tip, idx) in interviewData.preparationTips"
            :key="idx"
            class="flex items-start gap-2 text-sm text-slate-300"
          >
            <span class="text-blue-400 mt-0.5">✓</span>
            {{ tip }}
          </li>
        </ul>
      </div>

      <button
        @click="resetQuestions"
        class="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all"
      >
        Gerar Novas Perguntas
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
defineEmits(['back']);

const selectedCvId = ref('');
const jobDescription = ref('');
const interviewData = ref(null);

// Mock CVs
const cvs = ref([
  { id: '1', title: 'CV João Silva' },
  { id: '2', title: 'CV Maria Fernandes' },
  { id: '3', title: 'CV Pedro Costa' }
]);

const generateQuestions = () => {
  if (!selectedCvId.value) return;

  // Mock interview questions
  interviewData.value = {
    questions: [
      {
        category: 'Comportamental',
        difficulty: 'Média',
        question: 'Fale sobre uma situação em que você lidou com um conflito na equipe.',
        tips: 'Mostre como você comunicou de forma clara e resolveu o problema.'
      },
      {
        category: 'Técnica',
        difficulty: 'Alta',
        question: 'Explique como você otimizaria uma query SQL complexa.',
        tips: 'Mostre conhecimento em índices, joins e performance.'
      },
      {
        category: 'Comportamental',
        difficulty: 'Fácil',
        question: 'Como você lida com prazos apertados?',
        tips: 'Demonstre organização e priorização.'
      }
    ],
    preparationTips: [
      'Revise o CV e destaque experiências relevantes.',
      'Pratique respostas concisas para perguntas comportamentais.',
      'Pesquise sobre a empresa e a vaga.'
    ]
  };
};

const resetQuestions = () => {
  interviewData.value = null;
  jobDescription.value = '';
  selectedCvId.value = '';
};
</script>

