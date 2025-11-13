<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Navbar -->

    <div class=" rounded-lg">
      <nav class="bg-slate-900 border-b border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-4">
              <button @click="$emit('cancel')" class="text-slate-400 hover:text-slate-100 transition">
                ← Voltar
              </button>
              <h1 class="text-xl font-bold">Criar Novo CV</h1>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-400">Passo {{ currentStep }} de {{ totalSteps }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Progress Bar -->
      <div class="bg-slate-900 border-b border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div v-for="(step, index) in steps" :key="index" class="flex items-center flex-1">
              <div class="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                :class="getStepClass(index + 1)">
                {{ index + 1 }}
              </div>
              <div class="ml-2 hidden md:block">
                <div class="text-xs font-medium" :class="getStepTextClass(index + 1)">
                  {{ step.label }}
                </div>
              </div>
              <div v-if="index < steps.length - 1" class="flex-1 h-1 mx-2 transition-all"
                :class="currentStep > index + 1 ? 'bg-blue-600' : 'bg-slate-700'"></div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Content -->
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Step 1: Informações do CV e Template -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">📄 Informações do CV</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-2">Título do CV *</label>
              <input v-model="formData.title" type="text" required
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Ex: CV Full-Stack Developer" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Cargo Alvo *</label>
              <input v-model="formData.targetRole" type="text" required
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Ex: Desenvolvedor Full-Stack" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Área Profissional</label>
              <input v-model="formData.jobTargetArea" type="text"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Ex: Tecnologia" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Idioma</label>
              <select v-model="formData.language"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100">
                <option value="PT">Português</option>
                <option value="EN">Inglês</option>
                <option value="ES">Espanhol</option>
                <option value="FR">Francês</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Template *</label>
            <select v-model="formData.templateId" required
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100">
              <option value="">Seleciona um template</option>
              <option v-for="template in templateStore.templates" :key="template.id" :value="template.id">
                {{ template.name }} ({{ template.type }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 2: Dados Pessoais -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">📋 Dados Pessoais</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome Completo *</label>
              <input v-model="formData.personalInfo.name" type="text" required
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="João Silva" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input v-model="formData.personalInfo.email" type="email" required
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="joao@example.com" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Telefone *</label>
              <input v-model="formData.personalInfo.phone" type="tel" required
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="+351 912 345 678" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Localização</label>
              <input v-model="formData.personalInfo.location" type="text"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Lisboa, Portugal" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">LinkedIn</label>
              <input v-model="formData.personalInfo.linkedin" type="url"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="https://linkedin.com/in/..." />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">GitHub</label>
              <input v-model="formData.personalInfo.github" type="url"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="https://github.com/..." />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Resumo Profissional</label>
            <div class="relative">
              <textarea v-model="formData.summary" rows="4"
                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Breve descrição sobre ti e tua experiência..."></textarea>
              <button type="button" @click="generateSummary" :disabled="loadingAI"
                class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50">
                {{ loadingAI ? '⏳' : '✨ Gerar com IA' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Experiências -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">💼 Experiência Profissional</h2>
            <button type="button" @click="addExperience"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(exp, index) in formData.experiences" :key="index"
            class="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-slate-100">Experiência {{ index + 1 }}</h3>
              <button type="button" @click="removeExperience(index)" class="text-red-400 hover:text-red-300 text-sm">
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Cargo *</label>
                <input v-model="exp.jobTitle" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Desenvolvedor Full-Stack" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Empresa *</label>
                <input v-model="exp.company" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Tech Company Lda" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Localização</label>
                <input v-model="exp.location" type="text"
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Lisboa, Portugal" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Data Início *</label>
                <input v-model="exp.startDate" type="month" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Data Fim</label>
                <input v-model="exp.endDate" type="month" :disabled="exp.isCurrent"
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 disabled:opacity-50" />
                <label class="flex items-center mt-2 text-sm text-slate-300">
                  <input v-model="exp.isCurrent" type="checkbox" class="mr-2" />
                  Trabalho atual
                </label>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2 text-slate-300">Descrição *</label>
              <div class="relative">
                <textarea v-model="exp.description" rows="3" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Descreve as tuas responsabilidades e conquistas..."></textarea>
                <button type="button" @click="improveDescription(index)" :disabled="loadingAI"
                  class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50">
                  {{ loadingAI ? '⏳' : '✨ Melhorar' }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="formData.experiences.length === 0" class="text-slate-400 text-center py-4">
            Nenhuma experiência adicionada ainda. Clique em "Adicionar" para começar.
          </p>
        </div>
      </div>

      <!-- Step 4: Educação -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">🎓 Formação Académica</h2>
            <button type="button" @click="addEducation"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(edu, index) in formData.educations" :key="index"
            class="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-slate-100">Formação {{ index + 1 }}</h3>
              <button type="button" @click="removeEducation(index)" class="text-red-400 hover:text-red-300 text-sm">
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Instituição *</label>
                <input v-model="edu.institution" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Universidade de Aveiro" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Grau *</label>
                <input v-model="edu.degree" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Licenciatura" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Área *</label>
                <input v-model="edu.fieldOfStudy" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Engenharia Informática" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Data Fim *</label>
                <input v-model="edu.endDate" type="month" required :disabled="edu.isCurrent"
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 disabled:opacity-50" />
                <label class="flex items-center mt-2 text-sm text-slate-300">
                  <input v-model="edu.isCurrent" type="checkbox" class="mr-2" />
                  Em curso
                </label>
              </div>
            </div>
          </div>

          <p v-if="formData.educations.length === 0" class="text-slate-400 text-center py-4">
            Nenhuma formação adicionada ainda. Clique em "Adicionar" para começar.
          </p>
        </div>
      </div>

      <!-- Step 5: Skills -->
      <div v-if="currentStep === 5" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">🛠️ Competências</h2>

          <div class="mb-4">
            <div class="flex gap-2">
              <input v-model="newSkill" type="text" @keyup.enter="addSkill"
                class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Ex: Vue.js, Node.js, PostgreSQL..." />
              <button type="button" @click="addSkill"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Adicionar
              </button>
              <button type="button" @click="suggestSkills" :disabled="loadingAI"
                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50">
                {{ loadingAI ? '⏳' : '✨ Sugerir' }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span v-for="(skill, index) in formData.skills" :key="index"
              class="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center space-x-2">
              <span>{{ typeof skill === 'string' ? skill : skill.name }}</span>
              <button type="button" @click="removeSkill(index)" class="text-blue-200 hover:text-white font-bold">
                ×
              </button>
            </span>
          </div>

          <p v-if="formData.skills.length === 0" class="text-slate-400 text-center py-4">
            Nenhuma competência adicionada ainda.
          </p>
        </div>
      </div>

      <!-- Step 6: Projetos -->
      <div v-if="currentStep === 6" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">🚀 Projetos</h2>
            <button type="button" @click="addProject"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(proj, index) in formData.projects" :key="index"
            class="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-slate-100">Projeto {{ index + 1 }}</h3>
              <button type="button" @click="removeProject(index)" class="text-red-400 hover:text-red-300 text-sm">
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Título do Projeto *</label>
                <input v-model="proj.name" type="text" required
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Nome do Projeto" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Teu Papel</label>
                <input v-model="proj.role" type="text"
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="Desenvolvedor Full-Stack" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2 text-slate-300">URL</label>
                <input v-model="proj.url" type="url"
                  class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                  placeholder="https://github.com/..." />
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2 text-slate-300">Descrição *</label>
              <textarea v-model="proj.description" rows="3" required
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Descreve o projeto e o teu contributo..."></textarea>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2 text-slate-300">Tecnologias (separadas por vírgula)</label>
              <input v-model="proj.technologiesStr" type="text"
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
                placeholder="Vue.js, Node.js, PostgreSQL" />
            </div>
          </div>

          <p v-if="formData.projects.length === 0" class="text-slate-400 text-center py-4">
            Nenhum projeto adicionado ainda. Clique em "Adicionar" para começar.
          </p>
        </div>
      </div>

      <!-- Step 7: Preview e Gerar -->
      <div v-if="currentStep === 7" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">👁️ Preview do CV</h2>

          <div v-if="generating" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-slate-400">A gerar CV...</p>
            </div>
          </div>

          <div v-else-if="previewHTML" class="mb-6">
            <div class="bg-white rounded-lg p-4 mb-4" style="max-height: 600px; overflow-y: auto;">
              <div v-html="previewHTML"></div>
            </div>

            <div class="flex gap-4">
              <button @click="downloadPDF" :disabled="downloading || !createdCVId"
                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium">
                {{ downloading ? '⏳ A baixar...' : '📥 Download PDF' }}
              </button>
              <button @click="goToDashboard"
                class="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                Ver no Dashboard
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-slate-400 mb-4">Clique em "Gerar CV" para ver o preview</p>
            <button @click="generateCV" :disabled="generating"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium">
              {{ generating ? '⏳ A gerar...' : '✨ Gerar CV' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8">
        <button v-if="currentStep > 1" @click="previousStep"
          class="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
          ← Anterior
        </button>
        <div v-else></div>

        <!-- Botão Próximo - aparece do passo 1 ao 6 -->
        <button v-if="currentStep < 7" @click="nextStep" :disabled="!canProceed"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {{ currentStep === 6 ? 'Ver Preview →' : 'Próximo →' }}
        </button>
        <div v-else></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'
import { useAIStore } from '../../stores/ai'
import { useTemplateStore } from '../../stores/template'

export default {
  name: 'CreateCVWizard',

  emits: ['cancel', 'complete'],

  data() {
    return {
      currentStep: 1,
      totalSteps: 7,
      cvStore: null,
      formData: {
        title: '',
        templateId: '',
        targetRole: '',
        language: 'PT',
        jobTargetTitle: '',
        jobTargetArea: '',
        generatePdf: false, // Não gerar PDF automaticamente, só quando fizer download
        personalInfo: {
          name: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: ''
        },
        summary: '',
        experiences: [],
        educations: [],
        projects: [],
        skills: []
      },
      newSkill: '',
      loadingAI: false,
      generating: false,
      downloading: false,
      previewHTML: null,
      createdCVId: null,
      steps: [
        { label: 'Informações', key: 'info' },
        { label: 'Dados Pessoais', key: 'personal' },
        { label: 'Experiências', key: 'experiences' },
        { label: 'Educação', key: 'education' },
        { label: 'Competências', key: 'skills' },
        { label: 'Projetos', key: 'projects' },
        { label: 'Preview', key: 'preview' }
      ]
    }
  },

  created() {
    this.cvStore = useCVStore();
    this.aiStore = useAIStore();
  },

  computed: {
    templateStore() {
      return useTemplateStore()
    },
    canProceed() {
      switch (this.currentStep) {
        case 1:
          return this.formData.title && this.formData.templateId && this.formData.targetRole
        case 2:
          return this.formData.personalInfo.name && this.formData.personalInfo.email && this.formData.personalInfo.phone
        case 3:
          return true // Experiências são opcionais
        case 4:
          return true // Educação é opcional
        case 5:
          return true // Skills são opcionais
        case 6:
          return true // Projetos são opcionais
        default:
          return true
      }
    }
  },


  async mounted() {
    // Carregar templates
    await this.templateStore.fetchTemplates()
  },

  methods: {
    nextStep() {
      if (this.canProceed && this.currentStep < this.totalSteps) {
        this.currentStep++
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    getStepClass(step) {
      if (step < this.currentStep) {
        return 'bg-green-600 text-white'
      } else if (step === this.currentStep) {
        return 'bg-blue-600 text-white'
      } else {
        return 'bg-slate-700 text-slate-400'
      }
    },

    getStepTextClass(step) {
      if (step <= this.currentStep) {
        return 'text-slate-100'
      } else {
        return 'text-slate-400'
      }
    },

    // Experiências
    addExperience() {
      this.formData.experiences.push({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        achievements: [],
        skills: []
      })
    },

    removeExperience(index) {
      this.formData.experiences.splice(index, 1)
    },

    async improveDescription(index) {
      const exp = this.formData.experiences[index]
      if (!exp.description || !exp.jobTitle || !exp.company) {
        alert('Preenche o cargo, empresa e descrição primeiro!')
        return
      }

      try {
        this.loadingAI = true
        const response = await aiStore.improveExperience({
          description: exp.description,
          jobTitle: exp.jobTitle,
          company: exp.company
        })
        this.formData.experiences[index].description = response.data.improved
      } catch (error) {
        console.error('Erro ao melhorar descrição:', error)
        alert('Erro ao melhorar descrição')
      } finally {
        this.loadingAI = false
      }
    },

    // Formação
    addEducation() {
      this.formData.educations.push({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        grade: '',
        description: ''
      })
    },

    removeEducation(index) {
      this.formData.educations.splice(index, 1)
    },

    // Projetos
    addProject() {
      this.formData.projects.push({
        name: '',
        description: '',
        role: '',
        url: '',
        technologiesStr: '',
        technologies: [],
        highlights: []
      })
    },

    removeProject(index) {
      this.formData.projects.splice(index, 1)
    },

    // Competências
    addSkill() {
      if (this.newSkill.trim()) {
        this.formData.skills.push({
          name: this.newSkill.trim(),
          category: '',
          level: 0,
          yearsOfExp: 0
        })
        this.newSkill = ''
      }
    },

    removeSkill(index) {
      this.formData.skills.splice(index, 1)
    },

    async suggestSkills() {
      if (!this.formData.targetRole) {
        alert('Preenche o cargo alvo primeiro!')
        return
      }

      try {
        this.loadingAI = true
        const response = await aiStore.suggestSkills({
          jobTitle: this.formData.targetRole,
          jobArea: this.formData.jobTargetArea
        })

        response.data.suggestions.forEach(skill => {
          if (!this.formData.skills.find(s => s.name === skill.skill)) {
            this.formData.skills.push({
              name: skill.skill,
              category: skill.category,
              level: 0,
              yearsOfExp: 0
            })
          }
        })
      } catch (error) {
        console.error('Erro ao sugerir competências:', error)
        alert('Erro ao sugerir competências')
      } finally {
        this.loadingAI = false
      }
    },

    async generateSummary() {
      if (!this.formData.personalInfo.name || !this.formData.targetRole) {
        alert('Preenche nome e cargo alvo primeiro!')
        return
      }

      try {
        this.loadingAI = true
        const response = await aiStore.generateSummary({
          name: this.formData.personalInfo.name,
          targetRole: this.formData.targetRole,
          experiences: this.formData.experiences,
          skills: this.formData.skills
        })
        this.formData.summary = response.data.summary
      } catch (error) {
        console.error('Erro ao gerar resumo:', error)
        alert('Erro ao gerar resumo')
      } finally {
        this.loadingAI = false
      }
    },

    // Gerar CV
    async generateCV() {
      if (!this.formData.title || !this.formData.templateId || !this.formData.targetRole) {
        alert('Preenche título, template e cargo alvo!')
        return
      }

      if (!this.formData.personalInfo.name || !this.formData.personalInfo.email || !this.formData.personalInfo.phone) {
        alert('Preenche dados pessoais obrigatórios!')
        return
      }

      try {
        this.generating = true

        // Processar projetos
        const processedProjects = this.formData.projects.map(proj => ({
          name: proj.name,
          description: proj.description,
          role: proj.role,
          url: proj.url,
          technologies: proj.technologiesStr
            ? proj.technologiesStr.split(',').map(t => t.trim())
            : [],
          highlights: proj.highlights || []
        }))

        // Construir payload
        const payload = {
          title: this.formData.title,
          templateId: this.formData.templateId,
          targetRole: this.formData.targetRole,
          language: this.formData.language,
          jobTargetTitle: this.formData.targetRole,
          jobTargetArea: this.formData.jobTargetArea,
          generatePdf: false, // Não gerar PDF ainda, só quando fizer download
          contentJson: {
            personalInfo: {
              name: this.formData.personalInfo.name,
              email: this.formData.personalInfo.email,
              phone: this.formData.personalInfo.phone,
              location: this.formData.personalInfo.location,
              linkedin: this.formData.personalInfo.linkedin,
              github: this.formData.personalInfo.github,
              website: this.formData.personalInfo.website
            },
            summary: this.formData.summary,
            experiences: this.formData.experiences.map(exp => ({
              jobTitle: exp.jobTitle,
              company: exp.company,
              location: exp.location,
              startDate: exp.startDate,
              endDate: exp.isCurrent ? null : exp.endDate,
              isCurrent: exp.isCurrent,
              description: exp.description,
              achievements: exp.achievements || [],
              skills: exp.skills || []
            })),
            educations: this.formData.educations.map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              location: edu.location,
              startDate: edu.startDate,
              endDate: edu.isCurrent ? null : edu.endDate,
              isCurrent: edu.isCurrent,
              grade: edu.grade || '',
              description: edu.description || ''
            })),
            projects: processedProjects,
            skills: this.formData.skills.map(skill => ({
              name: typeof skill === 'string' ? skill : skill.name,
              category: typeof skill === 'object' ? skill.category : '',
              level: typeof skill === 'object' ? skill.level : 0,
              yearsOfExp: typeof skill === 'object' ? skill.yearsOfExp : 0
            })),
            certifications: [],
            languages: []
          }
        }

        // Criar CV
        const result = await this.cvStore.createCV(payload)

        if (result.success && result.cv?.id) {
          // Garantir que o ID é uma string
          const cvId = typeof result.cv.id === 'string' ? result.cv.id : String(result.cv.id)
          this.createdCVId = cvId
          console.log('✅ CV criado com ID:', cvId, typeof cvId)

          // Carregar preview
          try {
            const previewResponse = await this.cvStore.previewCV(cvId)
            if (previewResponse.success) {
              this.previewHTML = previewResponse.html
            } else {
              throw new Error(previewResponse.message || 'Erro ao carregar preview')
            }
          } catch (error) {
            console.error('Erro ao carregar preview:', error)
            alert('CV criado mas não foi possível carregar o preview. Podes fazer download mais tarde.')
          }
        } else {
          throw new Error(result.message || 'Erro ao criar CV')
        }
      } catch (error) {
        console.error('❌ Erro ao gerar CV:', error)
        alert(`Erro ao gerar CV: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`)
      } finally {
        this.generating = false
      }
    },

    // Download PDF
    async downloadPDF() {
      if (!this.createdCVId) {
        alert('CV ainda não foi criado!')
        return
      }

      try {
        // Garantir que o ID é uma string
        const cvId = typeof this.createdCVId === 'string' ? this.createdCVId : String(this.createdCVId)
        console.log('📥 Fazendo download do CV com ID:', cvId, typeof cvId)

        this.downloading = true
        const result = await this.cvStore.downloadCV(cvId)

        if (!result.success) {
          throw new Error(result.message || 'Erro ao fazer download')
        }
      } catch (error) {
        console.error('Erro ao fazer download:', error)
        alert(`Erro ao fazer download do PDF: ${error.message || 'Erro desconhecido'}`)
      } finally {
        this.downloading = false
      }
    },

    goToDashboard() {
      this.$emit('complete')
    }
  }
}
</script>

<style scoped>
/* Estilos específicos do wizard */
</style>
