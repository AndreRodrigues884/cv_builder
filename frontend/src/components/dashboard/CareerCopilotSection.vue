<template>
  <div v-if="activeSection === 'career-copilot'">
    <!-- Menu Principal do Career Copilot -->
    <div v-if="careerCopilotSection === 'menu'" class="max-w-4xl mx-auto">
      <div
        class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold mb-2">🚀 Career Copilot</h2>
            <p class="text-slate-400">Teu assistente pessoal de carreira com IA</p>
          </div>
          <span
            class="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-semibold">
            Premium
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card 1: Simulação de Entrevista -->
        <div @click="careerCopilotSection = 'interview'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group">
          <div class="text-3xl mb-4">💬</div>
          <h3 class="text-lg font-bold mb-2">Simulação de Entrevista</h3>
          <p class="text-sm text-slate-400 mb-4">Prepara-te com perguntas geradas pela IA baseadas no teu CV
          </p>
          <button class="text-purple-500 text-sm font-medium group-hover:text-purple-400">Começar →</button>
        </div>

        <!-- Card 2: Análise de Carreira -->
        <div @click="careerCopilotSection = 'career'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group">
          <div class="text-3xl mb-4">📈</div>
          <h3 class="text-lg font-bold mb-2">Análise de Carreira</h3>
          <p class="text-sm text-slate-400 mb-4">Descobre os melhores caminhos para a tua progressão profissional</p>
          <button class="text-blue-500 text-sm font-medium group-hover:text-blue-400">Analisar →</button>
        </div>

        <!-- Card 3: Lacunas de Competências -->
        <div @click="careerCopilotSection = 'skills'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer group">
          <div class="text-3xl mb-4">🎯</div>
          <h3 class="text-lg font-bold mb-2">Lacunas de Competências</h3>
          <p class="text-sm text-slate-400 mb-4">Identifica skills que faltam para atingir os teus objetivos</p>
          <button class="text-cyan-500 text-sm font-medium group-hover:text-cyan-400">Descobrir →</button>
        </div>

        <!-- Card 4: Recomendação de Cursos -->
        <div @click="careerCopilotSection = 'courses'"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all cursor-pointer group">
          <div class="text-3xl mb-4">📚</div>
          <h3 class="text-lg font-bold mb-2">Recomendação de Cursos</h3>
          <p class="text-sm text-slate-400 mb-4">Cursos e formações personalizadas para o teu crescimento</p>
          <button class="text-green-500 text-sm font-medium group-hover:text-green-400">Ver Cursos →</button>
        </div>
      </div>
    </div>

    <!-- Componentes Ativos -->
    <InterviewSimulation v-if="careerCopilotSection === 'interview'" @back="careerCopilotSection = 'menu'" />
    <CareerAnalysis v-if="careerCopilotSection === 'career'" @back="careerCopilotSection = 'menu'" />
    <SkillGaps v-if="careerCopilotSection === 'skills'" @back="careerCopilotSection = 'menu'" @navigate="careerCopilotSection = $event" />
    <CoursesRecommendation v-if="careerCopilotSection === 'courses'" @back="careerCopilotSection = 'menu'" />
  </div>
</template>

<script>
import InterviewSimulation from './InterviewSimulation.vue';
import CareerAnalysis from './CareerAnalysis.vue';
import SkillGaps from './SkillGaps.vue';
import CoursesRecommendation from './CoursesRecommendation.vue';

export default {
  name: 'CareerCopilot',
  components: {
    InterviewSimulation,
    CareerAnalysis,
    SkillGaps,
    CoursesRecommendation
  },
  props: {
    activeSection: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      careerCopilotSection: 'menu'
    };
  }
};
</script>
