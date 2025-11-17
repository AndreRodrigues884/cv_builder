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
        <a href="#dashboard" @click.prevent="changeSection('dashboard')"
          :class="uiStore.activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">📊</span>
          <span class="font-medium">Dashboard</span>
        </a>

        <a href="#create-cv" @click.prevent="changeSection('create-cv')"
          :class="uiStore.activeSection === 'create-cv' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">✨</span>
          <span class="font-medium">Criar CV</span>
        </a>

        <a href="#my-cvs" @click.prevent="changeSection('my-cvs')"
          :class="uiStore.activeSection === 'my-cvs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">📄</span>
          <span class="font-medium">Meus CVs</span>
        </a>

        <a href="#ai-review" @click.prevent="changeSection('ai-review')"
          :class="uiStore.activeSection === 'ai-review' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🤖</span>
          <span class="font-medium">AI Review</span>
        </a>

        <a href="#job-match" @click.prevent="changeSection('job-match')"
          :class="uiStore.activeSection === 'job-match' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🎯</span>
          <span class="font-medium">Job Match</span>
          <span class="ml-auto text-xs bg-purple-600 px-2 py-0.5 rounded">Pro</span>
        </a>

        <a href="#career-copilot" @click.prevent="changeSection('career-copilot')"
          :class="uiStore.activeSection === 'career-copilot' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">🚀</span>
          <span class="font-medium">Career Copilot</span>
          <span class="ml-auto text-xs bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 rounded">Premium</span>
        </a>

        <a href="#templates" @click.prevent="changeSection('templates')"
          :class="uiStore.activeSection === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
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

        <a href="#settings" @click.prevent="changeSection('settings')"
          :class="uiStore.activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all">
          <span class="text-xl">⚙️</span>
          <span class="font-medium">Definições</span>
        </a>

        <button @click.prevent="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
          <span class="text-xl">🚪</span>
          <span class="font-medium cursor-pointer">Sair</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'

export default defineComponent({
  name: 'Sidebar',

  data() {
    return {
      // nenhuma seção local necessária, vamos usar a store
    }
  },

  computed: {
    uiStore() {
      return useUIStore()
    }
  },

  created() {
    this.authStore = useAuthStore()
    this.router = useRouter()
  },

  methods: {
    changeSection(section) {
      this.uiStore.setActiveSection(section)
    },

    async handleLogout() {
      await this.authStore.logout()
      this.router.push('/login')
      window.location.reload()
    }
  }
})
</script>
