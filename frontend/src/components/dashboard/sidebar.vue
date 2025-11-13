<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-40">
    <div class="p-6">
      <div class="flex items-center gap-2 mb-8">
        <span class="text-3xl">📄</span>
        <span class="text-xl font-bold">
          CV<span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Builder</span>
        </span>
      </div>

      <nav class="space-y-2">
        <a href="#dashboard" @click="changeSection('dashboard')"
          :class="activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">📊</span>
          <span class="font-medium">Dashboard</span>
        </a>

        <a href="#create-cv" @click="changeSection('create-cv')"
          :class="activeSection === 'create-cv' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">✨</span>
          <span class="font-medium">Criar CV</span>
        </a>

        <a href="#my-cvs" @click="changeSection('my-cvs')"
          :class="activeSection === 'my-cvs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">📄</span>
          <span class="font-medium">Meus CVs</span>
        </a>

        <a href="#ai-review" @click="changeSection('ai-review')"
          :class="activeSection === 'ai-review' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🤖</span>
          <span class="font-medium">AI Review</span>
        </a>

        <a href="#job-match" @click="changeSection('job-match')"
          :class="activeSection === 'job-match' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🎯</span>
          <span class="font-medium">Job Match</span>
          <span class="ml-auto text-xs bg-purple-600 px-2 py-0.5 rounded">Pro</span>
        </a>

        <a href="#career-copilot" @click="changeSection('career-copilot')"
          :class="activeSection === 'career-copilot' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🚀</span>
          <span class="font-medium">Career Copilot</span>
          <span class="ml-auto text-xs bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 rounded">Premium</span>
        </a>

        <a href="#templates" @click="changeSection('templates')"
          :class="activeSection === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🎨</span>
          <span class="font-medium">Templates</span>
        </a>

        <div class="border-t border-slate-800 my-4"></div>

        <router-link to="/profile"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-all">
          <span class="text-xl">👤</span>
          <span class="font-medium">Perfil</span>
        </router-link>

        <a href="#settings" @click="changeSection('settings')"
          :class="activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">⚙️</span>
          <span class="font-medium">Definições</span>
        </a>

        <button @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
          <span class="text-xl">🚪</span>
          <span class="font-medium cursor-pointer">Sair</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script>
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

export default {
  name: 'Sidebar',

  props: {
    activeSection: {
      type: String,
      required: true
    }
  },

  emits: ['change-section'],

  created() {
    this.authStore = useAuthStore();
    this.router = useRouter();
  },

  methods: {
    changeSection(section) {
      this.$emit("change-section", section);
    },
    async handleLogout() {
      this.authStore.logout();
      this.router.push("/login");
      window.location.reload();
    },
  }

}

</script>