<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Sidebar (mesmo da Dashboard) -->
    <aside class="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-40">
      <div class="p-6">
        <router-link to="/dashboard" class="flex items-center gap-2 mb-8">
          <span class="text-3xl">📄</span>
          <span class="text-xl font-bold">
            CV<span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Builder</span>
          </span>
        </router-link>

        <nav class="space-y-2">
          <router-link to="/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-all">
            <span class="text-xl">📊</span>
            <span class="font-medium">Dashboard</span>
          </router-link>

          <router-link to="/profile"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white transition-all">
            <span class="text-xl">👤</span>
            <span class="font-medium">Perfil</span>
          </router-link>

          <div class="border-t border-slate-800 my-4"></div>

          <button @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
            <span class="text-xl">🚪</span>
            <span class="font-medium">Sair</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 min-h-screen">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div class="px-8 py-4">
          <h1 class="text-2xl font-bold">Meu Perfil</h1>
          <p class="text-sm text-slate-400">Gere as tuas informações profissionais</p>
        </div>
      </header>

      <div class="flex flex-col p-8 max-w-6xl gap-8 mx-auto">
        <!-- Profile Content -->
        <ProfileBasic></ProfileBasic>
        <ProfileExperience></ProfileExperience>
        <ProfileEducation></ProfileEducation>
        <ProfileSkills></ProfileSkills>


      </div>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import ProfileBasic from '../components/profile/BasicInfoView.vue'
import ProfileExperience from '../components/profile/ExperienceSection.vue'
import ProfileEducation from '../components/profile/EducationSection.vue'
import ProfileSkills from '../components/profile/SkillsSection.vue'

export default {
  name: 'Profile',

  components: {
    ProfileBasic,
    ProfileExperience,
    ProfileEducation,
    ProfileSkills
  },


  data() {
    return {
      loading: true,
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    },
    profileStore() {
      return useProfileStore()
    },
    user() {
      return this.profileStore.user
    },
    profile() {
      return this.profileStore.profile
    },
    billing() {
      return this.profileStore.billing
    }
  },

  methods: {
    async handleLogout() {
      await this.authStore.logout()
      this.$router.push('/login')
      window.location.reload()
    },

    async loadProfile() {
      try {
        await this.profileStore.getMe();
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.loadProfile();
  },
}
</script>