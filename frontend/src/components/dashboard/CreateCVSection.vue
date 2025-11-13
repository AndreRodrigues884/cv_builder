<template>
    <div class="min-h-screen bg-slate-950">
        <!-- Navbar -->
        <nav class="bg-slate-950 shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center space-x-4">
                        <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">
                            ← Voltar
                        </router-link>
                        <h1 class="text-xl font-bold text-white">Criar Novo CV</h1>
                    </div>
                    <div class="flex items-center">
                        <button @click="handleSave" :disabled="saving"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                            {{ saving ? 'A guardar...' : '💾 Guardar CV' }}
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <form @submit.prevent="handleSave" class="space-y-6">

                <!-- Informações do CV -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <h2 class="text-2xl font-bold mb-4">📄 Informações do CV</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Título do CV *</label>
                            <input v-model="formData.title" type="text" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: CV Full-Stack Developer" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Cargo Alvo *</label>
                            <input v-model="formData.targetRole" type="text" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Desenvolvedor Full-Stack" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Área Profissional</label>
                            <input v-model="formData.jobTargetArea" type="text"
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Tecnologia" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Idioma</label>
                            <select v-model="formData.language"
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="PT">Português</option>
                                <option value="EN">Inglês</option>
                                <option value="ES">Espanhol</option>
                                <option value="FR">Francês</option>
                            </select>
                        </div>
                    </div>

                    <div class="mt-4">
                        <label class="block text-sm font-medium mb-2">Template *</label>
                        <select v-model="formData.templateId" required
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleciona um template</option>
                            <option v-for="template in templateStore.templates" :key="template.id" :value="template.id">
                                {{ template.name }} ({{ template.type }})
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Dados Pessoais -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <h2 class="text-2xl font-bold mb-4">📋 Dados Pessoais</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Nome Completo *</label>
                            <input v-model="formData.personalInfo.name" type="text" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="João Silva" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Email *</label>
                            <input v-model="formData.personalInfo.email" type="email" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="joao@example.com" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Telefone *</label>
                            <input v-model="formData.personalInfo.phone" type="tel" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+351 912 345 678" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Localização</label>
                            <input v-model="formData.personalInfo.location" type="text"
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Lisboa, Portugal" />
                        </div>
                    </div>

                    <div class="mt-4">
                        <label class="block text-sm font-medium mb-2">Resumo Profissional</label>
                        <div class="relative">
                            <textarea v-model="formData.summary" rows="4"
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Breve descrição sobre ti e tua experiência..."></textarea>
                            <button type="button" @click="generateSummary" :disabled="loadingAI"
                                class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50">
                                {{ loadingAI ? '⏳' : '✨ Gerar com IA' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Experiências -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">💼 Experiência Profissional</h2>
                        <button type="button" @click="addExperience"
                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                            ➕ Adicionar
                        </button>
                    </div>

                    <div v-for="(exp, index) in formData.experiences" :key="index" class="mb-6 p-4 border rounded-lg">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-semibold">Experiência {{ index + 1 }}</h3>
                            <button type="button" @click="removeExperience(index)"
                                class="text-red-600 hover:text-red-800 text-sm">
                                🗑️ Remover
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Cargo *</label>
                                <input v-model="exp.jobTitle" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Desenvolvedor Full-Stack" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Empresa *</label>
                                <input v-model="exp.company" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tech Company Lda" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Localização</label>
                                <input v-model="exp.location" type="text"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lisboa, Portugal" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Data Início *</label>
                                <input v-model="exp.startDate" type="month" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Data Fim</label>
                                <input v-model="exp.endDate" type="month" :disabled="exp.isCurrent"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                                <label class="flex items-center mt-2 text-sm">
                                    <input v-model="exp.isCurrent" type="checkbox" class="mr-2" />
                                    Trabalho atual
                                </label>
                            </div>
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium mb-2">Descrição *</label>
                            <div class="relative">
                                <textarea v-model="exp.description" rows="3" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Descreve as tuas responsabilidades e conquistas..."></textarea>
                                <button type="button" @click="improveDescription(index)" :disabled="loadingAI"
                                    class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50">
                                    {{ loadingAI ? '⏳' : '✨ Melhorar' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <p v-if="formData.experiences.length === 0" class="text-gray-500 text-center py-4">
                        Nenhuma experiência adicionada ainda
                    </p>
                </div>

                <!-- Formação -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">🎓 Formação Académica</h2>
                        <button type="button" @click="addEducation"
                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                            ➕ Adicionar
                        </button>
                    </div>

                    <div v-for="(edu, index) in formData.educations" :key="index" class="mb-6 p-4 border rounded-lg">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-semibold">Formação {{ index + 1 }}</h3>
                            <button type="button" @click="removeEducation(index)"
                                class="text-red-600 hover:text-red-800 text-sm">
                                🗑️ Remover
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Instituição *</label>
                                <input v-model="edu.institution" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Universidade de Aveiro" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Grau *</label>
                                <input v-model="edu.degree" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Licenciatura" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Área *</label>
                                <input v-model="edu.fieldOfStudy" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Engenharia Informática" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Localização</label>
                                <input v-model="edu.location" type="text"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Aveiro, Portugal" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Data Início</label>
                                <input v-model="edu.startDate" type="month"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Data Fim *</label>
                                <input v-model="edu.endDate" type="month" required :disabled="edu.isCurrent"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                                <label class="flex items-center mt-2 text-sm">
                                    <input v-model="edu.isCurrent" type="checkbox" class="mr-2" />
                                    Em curso
                                </label>
                            </div>
                        </div>
                    </div>

                    <p v-if="formData.educations.length === 0" class="text-gray-500 text-center py-4">
                        Nenhuma formação adicionada ainda
                    </p>
                </div>

                <!-- Projetos -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">🚀 Projetos</h2>
                        <button type="button" @click="addProject"
                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                            ➕ Adicionar
                        </button>
                    </div>

                    <div v-for="(proj, index) in formData.projects" :key="index" class="mb-6 p-4 border rounded-lg">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-semibold">Projeto {{ index + 1 }}</h3>
                            <button type="button" @click="removeProject(index)"
                                class="text-red-600 hover:text-red-800 text-sm">
                                🗑️ Remover
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Título do Projeto *</label>
                                <input v-model="proj.name" type="text" required
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nome do Projeto" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Teu Papel</label>
                                <input v-model="proj.role" type="text"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Desenvolvedor Full-Stack" />
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium mb-2">URL</label>
                                <input v-model="proj.url" type="url"
                                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://github.com/..." />
                            </div>
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium mb-2">Descrição *</label>
                            <textarea v-model="proj.description" rows="3" required
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Descreve o projeto e o teu contributo..."></textarea>
                        </div>

                        <div class="mt-4">
                            <label class="block text-sm font-medium mb-2">Tecnologias (separadas por vírgula)</label>
                            <input v-model="proj.technologiesStr" type="text"
                                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Vue.js, Node.js, PostgreSQL" />
                        </div>
                    </div>

                    <p v-if="formData.projects.length === 0" class="text-gray-500 text-center py-4">
                        Nenhum projeto adicionado ainda
                    </p>
                </div>

                <!-- Competências -->
                <div class="bg-slate-950 rounded-lg shadow p-6">
                    <h2 class="text-2xl font-bold mb-4">🛠️ Competências</h2>

                    <div class="mb-4">
                        <div class="flex space-x-2">
                            <input v-model="newSkill" type="text" @keyup.enter="addSkill"
                                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2">
                            <span>{{ typeof skill === 'string' ? skill : skill.name }}</span>
                            <button type="button" @click="removeSkill(index)"
                                class="text-blue-600 hover:text-blue-800 font-bold">
                                ×
                            </button>
                        </span>
                    </div>

                    <p v-if="formData.skills.length === 0" class="text-gray-500 text-center py-4">
                        Nenhuma competência adicionada ainda
                    </p>
                </div>

            </form>
        </div>
    </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'
import aiApi from '../../api/ai'
import { useTemplateStore } from "../../stores/template"

export default {
  name: 'CreateCV',

  data() {
    return {
      cvStore: null,
      
      formData: {
        // Campos obrigatórios do backend
        title: '',
        templateId: '',
        targetRole: '',
        language: 'PT',
        jobTargetTitle: '',
        jobTargetArea: '',
        generatePdf: true,
        
        // Personal Info (dentro de contentJson)
        personalInfo: {
          name: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: ''
        },
        
        // Content JSON
        summary: '',
        experiences: [],
        educations: [],
        projects: [],
        skills: []
      },

      templates: [],
      newSkill: '',
      saving: false,
      loadingAI: false
    }
  },

  created() {
    this.cvStore = useCVStore()
  },

  computed: {
    templateStore() {
      return useTemplateStore()
    },
    templates() {
      return this.templateStore.templates
    }
  },

  methods: {
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
        const response = await aiApi.improveExperience({
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
        const response = await aiApi.suggestSkills({
          jobTitle: this.formData.targetRole,
          jobArea: this.formData.jobTargetArea
        })
        
        // Adicionar skills sugeridas
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
        const response = await aiApi.generateSummary({
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

    // Guardar CV
    async handleSave() {
      if (!this.formData.title || !this.formData.templateId || !this.formData.targetRole) {
        alert('Preenche título, template e cargo alvo!')
        return
      }

      if (!this.formData.personalInfo.name || !this.formData.personalInfo.email || !this.formData.personalInfo.phone) {
        alert('Preenche dados pessoais obrigatórios!')
        return
      }

      try {
        this.saving = true

        // Processar projetos (converter technologiesStr em array)
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

        // Construir payload para o backend
        const payload = {
          title: this.formData.title,
          templateId: this.formData.templateId,
          targetRole: this.formData.targetRole,
          language: this.formData.language,
          jobTargetTitle: this.formData.targetRole,
          jobTargetArea: this.formData.jobTargetArea,
          generatePdf: this.formData.generatePdf,
          
          // ContentJson com estrutura correta
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

        console.log('📤 Enviando payload:', payload)

        // Chamar a store
        const result = await this.cvStore.createCV(payload)

        if (result.success) {
          alert('✅ CV criado com sucesso!')
          
          // Redirecionar para dashboard ou para visualização do CV
          if (result.cv?.id) {
            this.$router.push(`/cv/${result.cv.id}`)
          } else {
            this.$router.push('/dashboard')
          }
        } else {
          throw new Error(result.message || 'Erro ao criar CV')
        }

      } catch (error) {
        console.error('❌ Erro ao criar CV:', error)
        alert(`Erro ao criar CV: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.disabled\:bg-gray-100:disabled {
  background-color: #f3f4f6;
}
</style>