<!-- src/views/CareerCopilot.vue -->
<template>
  <div class="p-8">
    <!-- Menu Principal -->
    <div v-if="activeComponent === 'menu'" class="max-w-4xl mx-auto">
      <div class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold mb-2">🚀 Career Copilot</h2>
            <p class="text-slate-400">Teu assistente pessoal de carreira com IA</p>
          </div>
          <span class="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-semibold">
            Premium
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          @click="activeComponent = 'interview'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group"
        >
          <div class="text-3xl mb-4">💬</div>
          <h3 class="text-lg font-bold mb-2">Simulação de Entrevista</h3>
          <p class="text-sm text-slate-400 mb-4">Prepara-te com perguntas geradas pela IA baseadas no teu CV</p>
          <button class="text-purple-500 text-sm font-medium group-hover:text-purple-400">Começar →</button>
        </div>

        <div
          @click="activeComponent = 'career'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group"
        >
          <div class="text-3xl mb-4">📈</div>
          <h3 class="text-lg font-bold mb-2">Análise de Carreira</h3>
          <p class="text-sm text-slate-400 mb-4">Descobre os melhores caminhos para a tua progressão profissional</p>
          <button class="text-blue-500 text-sm font-medium group-hover:text-blue-400">Analisar →</button>
        </div>

        <div
          @click="activeComponent = 'skills'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer group"
        >
          <div class="text-3xl mb-4">🎯</div>
          <h3 class="text-lg font-bold mb-2">Lacunas de Competências</h3>
          <p class="text-sm text-slate-400 mb-4">Identifica skills que faltam para atingir os teus objetivos</p>
          <button class="text-cyan-500 text-sm font-medium group-hover:text-cyan-400">Descobrir →</button>
        </div>

        <div
          @click="activeComponent = 'courses'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all cursor-pointer group"
        >
          <div class="text-3xl mb-4">📚</div>
          <h3 class="text-lg font-bold mb-2">Recomendação de Cursos</h3>
          <p class="text-sm text-slate-400 mb-4">Cursos e formações personalizadas para o teu crescimento</p>
          <button class="text-green-500 text-sm font-medium group-hover:text-green-400">Ver Cursos →</button>
        </div>
      </div>
    </div>

    <!-- Componente Ativo -->
    <InterviewSimulation v-if="activeComponent === 'interview'" @back="activeComponent = 'menu'" />
    <CareerAnalysis v-if="activeComponent === 'career'" @back="activeComponent = 'menu'" />
    <SkillGaps v-if="activeComponent === 'skills'" @back="activeComponent = 'menu'" />
    <CoursesRecommendation v-if="activeComponent === 'courses'" @back="activeComponent = 'menu'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InterviewSimulation from '@/components/InterviewSimulation.vue';
import CareerAnalysis from '@/components/CareerAnalysis.vue';
import SkillGaps from '@/components/SkillGaps.vue';
import CoursesRecommendation from '@/components/CoursesRecommendation.vue';

const activeComponent = ref('menu');
</script>