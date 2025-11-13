<template>
  <div class="max-w-4xl mx-auto">
    <button
      @click="goBack"
      class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <span>←</span>
      Voltar
    </button>

    <div class="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-8 mb-6">
      <h1 class="text-3xl font-bold mb-2">📚 Recomendação de Cursos</h1>
      <p class="text-slate-400">Formações personalizadas para o teu crescimento</p>
    </div>

    <!-- Form -->
    <div v-if="!coursesData" class="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Orçamento (opcional)</label>
          <input
            v-model="budget"
            type="text"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
            placeholder="Ex: €200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Tempo Disponível/Semana</label>
          <input
            v-model="timeAvailable"
            type="text"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
            placeholder="Ex: 10 horas"
          />
        </div>
      </div>

      <button
        @click="recommendCourses"
        :disabled="loading"
        class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span v-if="loading">A procurar cursos...</span>
        <span v-else>📚 Recomendar Cursos</span>
      </button>
    </div>

    <!-- Results -->
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div class="text-green-400 mb-2">💰</div>
          <p class="text-sm text-slate-400">Custo Total</p>
          <p class="text-xl font-bold">{{ coursesData.totalCost }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div class="text-blue-400 mb-2">⏱️</div>
          <p class="text-sm text-slate-400">Tempo Total</p>
          <p class="text-xl font-bold">{{ coursesData.totalTime }}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div class="text-purple-400 mb-2">📚</div>
          <p class="text-sm text-slate-400">Cursos</p>
          <p class="text-xl font-bold">{{ coursesData.recommendations.length }}</p>
        </div>
      </div>

      <div
        v-for="(course, idx) in coursesData.recommendations"
        :key="idx"
        class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-xl font-bold mb-1">{{ course.title }}</h3>
            <p class="text-sm text-slate-400">{{ course.platform }}</p>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-green-400">{{ course.price }}</div>
            <div class="flex items-center gap-1 text-sm text-yellow-400">
              <span>⭐</span>
              <span>{{ course.rating }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 mb-3 text-sm text-slate-400">
          <span>⏱️ {{ course.duration }} horas</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="(skill, i) in course.skillsCovered"
            :key="i"
            class="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs"
          >
            {{ skill }}
          </span>
        </div>
        <button class="w-full bg-slate-800 border border-slate-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
          Ver Curso
        </button>
      </div>

      <div class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
        <h3 class="font-bold mb-3">📅 Plano de Aprendizagem</h3>
        <p class="text-sm text-slate-300">{{ coursesData.learningPlan }}</p>
      </div>

      <button
        @click="resetCourses"
        class="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all"
      >
        Procurar Novamente
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursesRecommendation',

  props: ['back'],

  data() {
    return {
      budget: '',
      timeAvailable: '',
      loading: false,
      coursesData: null
    };
  },

  methods: {
    goBack() {
      this.$emit('back');
    },

    recommendCourses() {
      this.loading = true;

      setTimeout(() => {
        this.coursesData = {
          totalCost: '€350',
          totalTime: '25 horas',
          recommendations: [
            {
              title: 'Advanced React & Redux',
              platform: 'Udemy',
              price: '€50',
              rating: 4.7,
              duration: 10,
              skillsCovered: ['React', 'Redux', 'Hooks']
            },
            {
              title: 'TypeScript Fundamentals',
              platform: 'Coursera',
              price: '€40',
              rating: 4.6,
              duration: 8,
              skillsCovered: ['TypeScript', 'JS', 'Typing']
            },
            {
              title: 'Node.js & Express - Build APIs',
              platform: 'Udemy',
              price: '€60',
              rating: 4.8,
              duration: 7,
              skillsCovered: ['Node.js', 'Express', 'APIs']
            },
            {
              title: 'UI/UX Design for Developers',
              platform: 'LinkedIn Learning',
              price: '€100',
              rating: 4.5,
              duration: 5,
              skillsCovered: ['UI Design', 'UX', 'Figma']
            }
          ],
          learningPlan: 'Começa pelo curso de TypeScript, depois React & Redux, seguido de Node.js APIs e finaliza com UI/UX Design.'
        };
        this.loading = false;
      }, 1200);
    },

    resetCourses() {
      this.coursesData = null;
    }
  }
};
</script>

