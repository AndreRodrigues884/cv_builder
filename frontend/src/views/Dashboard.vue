<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <Sidebar />

    <!-- Main Content -->
    <main class="ml-64 min-h-screen">
      <!-- Top Bar -->
     <Header :activeSection="uiStore.activeSection" />

      <router-view />

      <!-- Dashboard Content -->
      <div class="p-8">
        <!-- Dashboard Overview -->
        <div v-if="uiStore.activeSection === 'dashboard'">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">CVs Criados</span>
                <span class="text-2xl">📄</span>
              </div>
              <div v-if="!cvStore.loading" class="text-3xl font-bold text-blue-500">{{ stats.cvsCreated }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ stats.cvsLimit }} disponíveis este mês</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Score ATS Médio</span>
                <span class="text-2xl">✅</span>
              </div>
              <div class="text-3xl font-bold text-green-500">{{ stats.atsScore }}%</div>
              <div class="text-xs text-green-400 mt-1">+5% vs última análise</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Candidaturas</span>
                <span class="text-2xl">🎯</span>
              </div>
              <div class="text-3xl font-bold text-purple-500">{{ stats.applications }}</div>
              <div class="text-xs text-slate-500 mt-1">Este mês</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-orange-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Entrevistas</span>
                <span class="text-2xl">💼</span>
              </div>
              <div class="text-3xl font-bold text-orange-500">{{ stats.interviews }}</div>
              <div class="text-xs text-orange-400 mt-1">Taxa de 15%</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button @click="changeSection('create-cv')"
                class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-left hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">✨</div>
                <h3 class="text-lg font-bold mb-2">Criar Novo CV</h3>
                <p class="text-sm text-blue-100">Cria um CV profissional em minutos com IA</p>
              </button>

              <button @click="changeSection('ai-review')"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-blue-500/30 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">🎯</div>
                <h3 class="text-lg font-bold mb-2">AI Review</h3>
                <p class="text-sm text-slate-400">Analisa e melhora o teu CV</p>
              </button>

              <button @click="changeSection('templates')"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-purple-500/30 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">🎨</div>
                <h3 class="text-lg font-bold mb-2">Ver Templates</h3>
                <p class="text-sm text-slate-400">Explora designs profissionais</p>
              </button>
            </div>
          </div>

          <!-- Recent CVs -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">CVs Recentes</h2>
              <button @click="changeSection('my-cvs')"
                class="text-blue-500 hover:text-blue-400 text-sm font-medium">Ver todos →</button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div v-for="cv in allCVs" :key="cv.id"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-bold mb-1">{{ cv.title }}</h3>
                    <p class="text-sm text-slate-400">{{ cv.targetRole }}</p>
                  </div>
                  <span :class="cv.statusColor" class="px-3 py-1 rounded-full text-xs font-semibold">
                    {{ cv.status }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>Template: {{ cv.template }}</span>
                  <span>•</span>
                  <span>{{ cv.updatedAt }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium">
                    Editar
                  </button>
                  <button @click="downloadCV(cv)"
                    class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all text-sm font-medium">
                    Download
                  </button>
                  <button
                    class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CreateCVWizard v-if="uiStore.activeSection === 'create-cv'" @cancel="changeSection('dashboard')"
          @complete="changeSection('dashboard'); loadData()" />

        <!-- My CVs Section -->
        <MyCVs v-if="uiStore.activeSection === 'my-cvs'" />

        <!-- AI Review Section -->
        <AiReview v-if="uiStore.activeSection === 'ai-review'" />

        <!-- Job Match Section -->
        <JobMatch v-if="uiStore.activeSection === 'job-match'" />

        <!-- Career Copilot Section -->
        <CareerCopilot :activeSection="uiStore.activeSection" />


        <!-- Templates Section -->
        <div v-if="uiStore.activeSection === 'templates'">
          <div class="flex gap-4 mb-6">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              @click="templateStore.fetchTemplates()">
              Todos
            </button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all"
              @click="templateStore.fetchTemplatesByType('MODERN')">
              Moderno
            </button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all"
              @click="templateStore.fetchTemplatesByType('CLASSIC')">
              Clássico
            </button>
          </div>

          <div v-if="templateStore.loading" class="text-slate-400">Carregando templates...</div>
          <div v-else-if="templateStore.templates.length === 0" class="text-slate-500">Nenhum template encontrado.</div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="template in templateStore.templates" :key="template.id"
              class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all group cursor-pointer">
              <div
                class="h-64 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
                <img :src="template.previewImageUrl" alt="preview" class="object-contain w-full h-full rounded-lg" />
                <div
                  class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all">
                    Usar Template
                  </button>
                </div>
                <span v-if="template.isPremium"
                  class="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-xs font-semibold">
                  Premium
                </span>
              </div>
              <div class="p-4">
                <h3 class="font-bold mb-1">{{ template.name }}</h3>
                <p class="text-sm text-slate-400">{{ template.type }}</p>
              </div>
            </div>
          </div>
        </div>


        <!-- Settings Section -->
        <div v-if="uiStore.activeSection === 'settings'" class="max-w-4xl mx-auto">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-6">Definições</h2>

            <div class="space-y-6">
              <div>
                <h3 class="font-semibold mb-4">Conta</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <div class="font-medium">Email</div>
                      <div class="text-sm text-slate-400">user@example.com</div>
                    </div>
                    <button class="text-blue-500 text-sm hover:text-blue-400">Alterar</button>
                  </div>
                  <div class="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <div class="font-medium">Password</div>
                      <div class="text-sm text-slate-400">••••••••</div>
                    </div>
                    <button class="text-blue-500 text-sm hover:text-blue-400">Alterar</button>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-4">Plano</h3>
                <div
                  class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-lg font-bold">{{ userPlan }}</div>
                      <div class="text-sm text-slate-400">{{ stats.cvsCreated }}/{{ stats.cvsLimit }} CVs este mês
                      </div>
                    </div>
                    <router-link to="/upgrade"
                      class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold">
                      Upgrade
                    </router-link>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-4">Preferências</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-3">
                    <div>
                      <div class="font-medium">Notificações por Email</div>
                      <div class="text-sm text-slate-400">Receber atualizações e dicas</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked class="sr-only peer">
                      <div
                        class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

</template>

<script>
import Sidebar from "../components/dashboard/sidebar.vue"
import Header from "../components/dashboard/header.vue"
import { useCVStore } from "../stores/cv"
import { useTemplateStore } from "../stores/template"
import { useAIStore } from "../stores/ai";
import { useUIStore } from "../stores/ui";

// Componentes de secções
import AiReview from "../components/dashboard/AIReviewSection.vue"
import JobMatch from "../components/dashboard/JobMatchSection.vue"
import MyCVs from "../components/dashboard/MyCVsSection.vue"
import CareerCopilot from "../components/dashboard/CareerCopilotSection.vue"
import CreateCVWizard from "../components/dashboard/CreateCVWizard.vue"

export default {
  name: "Dashboard",

  components: {
    Sidebar,
    Header,
    AiReview,
    JobMatch,
    MyCVs,
    CareerCopilot,
    CreateCVWizard
  },

  data() {
    return {
      loading: false,
      stats: {
        cvsCreated: 0,
        published: 0,
        draft: 0,
        archived: 0
      },
      atsScores: [],
      error: null
    }
  },

  computed: {
    cvStore() {
      return useCVStore()
    },
    templateStore() {
      return useTemplateStore()
    },
    allCVs() {
      return this.cvStore.cvs
    },
    templates() {
      return this.templateStore.templates
    },
    aiStore() {
      return useAIStore()
    },
    uiStore() {
      return useUIStore()
    }
  },


  async mounted() {
    try {
      this.loading = true

      // 🔹 Carrega templates
      await this.templateStore.fetchTemplates()

      // 🔹 Carrega CVs
      const response = await this.cvStore.fetchCVs()
      if (response?.data) {
        this.cvStore.cvs = response.data.cvs.map(cv => {
          const template = this.templateStore.templates.find(t => t.id === cv.templateId)
          return {
            id: cv.id,
            title: cv.title,
            targetRole: cv.targetRole || "Não definido",
            status: cv.status,
            statusColor: this.getStatusColor(cv.status),
            template: template ? template.name : "Desconhecido",
            updatedAt: this.formatDate(cv.updatedAt)
          }
        })

        this.stats.cvsCreated = response.data.stats.total
        this.stats.published = response.data.stats.published
        this.stats.draft = response.data.stats.draft
        this.stats.archived = response.data.stats.archived

        // 🔹 Carrega todos os ATS scores e calcula média
        await this.loadAllAts()
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      this.error = error
    } finally {
      this.loading = false
    }
  },

  methods: {
    async loadData() {
      try {
        this.loading = true

        // 🔹 Primeiro, carrega os templates
        await this.templateStore.fetchTemplates()

        // 🔹 Depois, carrega os CVs
        const response = await this.cvStore.fetchCVs()
        if (!response?.data) return

        this.cvStore.cvs = response.data.cvs.map(cv => {
          const template = this.templateStore.templates.find(t => t.id === cv.templateId)
          return {
            id: cv.id,
            title: cv.title,
            targetRole: cv.targetRole || "Não definido",
            status: cv.status,
            statusColor: this.getStatusColor(cv.status),
            template: template ? template.name : "Desconhecido", // 👈 Mostra o nome
            updatedAt: this.formatDate(cv.updatedAt)
          }
        })

        this.stats.cvsCreated = response.data.stats.total
        this.stats.published = response.data.stats.published
        this.stats.draft = response.data.stats.draft
        this.stats.archived = response.data.stats.archived

      } catch (error) {
        console.error("Erro ao carregar CVs:", error)
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async loadAllAts() {
      if (!this.cvStore.cvs || this.cvStore.cvs.length === 0) return

      try {
        this.loading = true
        this.atsScores = []

        // Chama analyzeCV para cada CV e guarda o score
        for (const cv of this.cvStore.cvs) {
          const review = await this.aiStore.analyzeCV(cv.id)
          this.atsScores.push(review.scores.overall)
        }

        // Calcula média
        if (this.atsScores.length > 0) {
          const sum = this.atsScores.reduce((a, b) => a + b, 0)
          this.stats.atsScore = Math.round(sum / this.atsScores.length)
        }

      } catch (error) {
        console.error("Erro ao carregar ATS scores:", error)
        this.error = error
      } finally {
        this.loading = false
      }
    },

    getStatusColor(status) {
      switch (status) {
        case "PUBLISHED":
          return "bg-green-500/20 text-green-400"
        case "DRAFT":
          return "bg-yellow-500/20 text-yellow-400"
        case "ARCHIVED":
          return "bg-slate-700 text-slate-400"
        default:
          return "bg-slate-700 text-slate-400"
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      if (diff === 0) return "hoje"
      if (diff === 1) return "1 dia"
      return `${diff} dias`
    },

    async downloadCV(cv) {
      try {
        // Garantir que estamos passando o ID, não o objeto
        const cvId = typeof cv === 'string' ? cv : cv.id;

        if (!cvId) {
          alert('ID do CV não encontrado')
          return
        }

        // Usar a store para fazer download
        const result = await this.cvStore.downloadCV(cvId)

        if (!result.success) {
          alert(`Erro ao fazer download: ${result.message || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('Erro ao fazer download:', error)
        alert('Erro ao fazer download do CV')
      }
    },
    changeSection(section) {
      this.uiStore.setActiveSection(section)
    },
  }
}
</script>



<style scoped>
html {
  scroll-behavior: smooth;
}
</style>