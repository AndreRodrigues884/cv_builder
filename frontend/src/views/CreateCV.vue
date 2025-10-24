<!-- frontend/src/views/CreateCV.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">
              ← Voltar
            </router-link>
            <h1 class="text-xl font-bold text-gray-800">Criar Novo CV</h1>
          </div>
          <div class="flex items-center">
            <button 
              @click="handleSave"
              :disabled="saving"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ saving ? 'A guardar...' : '💾 Guardar CV' }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-8">
      <form @submit.prevent="handleSave" class="space-y-6">
        
        <!-- Dados Pessoais -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">📋 Dados Pessoais</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome Completo *</label>
              <input 
                v-model="formData.fullName" 
                type="text" 
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input 
                v-model="formData.email" 
                type="email" 
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="joao@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Telefone *</label>
              <input 
                v-model="formData.phone" 
                type="tel" 
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+351 912 345 678"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Localização</label>
              <input 
                v-model="formData.location" 
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lisboa, Portugal"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium mb-2">Resumo Profissional</label>
            <div class="relative">
              <textarea 
                v-model="formData.summary" 
                rows="4"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descrição sobre ti e tua experiência..."
              ></textarea>
              <button
                type="button"
                @click="generateSummary"
                :disabled="loadingAI"
                class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50"
              >
                {{ loadingAI ? '⏳' : '✨ Gerar com IA' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Experiências -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">💼 Experiência Profissional</h2>
            <button
              type="button"
              @click="addExperience"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
            >
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(exp, index) in formData.experiences" :key="index" class="mb-6 p-4 border rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold">Experiência {{ index + 1 }}</h3>
              <button
                type="button"
                @click="removeExperience(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Cargo *</label>
                <input 
                  v-model="exp.position" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Desenvolvedor Full-Stack"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Empresa *</label>
                <input 
                  v-model="exp.company" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tech Company Lda"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Data Início *</label>
                <input 
                  v-model="exp.startDate" 
                  type="month" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Data Fim</label>
                <input 
                  v-model="exp.endDate" 
                  type="month"
                  :disabled="exp.isCurrentJob"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <label class="flex items-center mt-2 text-sm">
                  <input 
                    v-model="exp.isCurrentJob" 
                    type="checkbox"
                    class="mr-2"
                  />
                  Trabalho atual
                </label>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2">Descrição *</label>
              <div class="relative">
                <textarea 
                  v-model="exp.description" 
                  rows="3"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreve as tuas responsabilidades e conquistas..."
                ></textarea>
                <button
                  type="button"
                  @click="improveDescription(index)"
                  :disabled="loadingAI"
                  class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
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
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">🎓 Formação Académica</h2>
            <button
              type="button"
              @click="addEducation"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
            >
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(edu, index) in formData.education" :key="index" class="mb-6 p-4 border rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold">Formação {{ index + 1 }}</h3>
              <button
                type="button"
                @click="removeEducation(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Instituição *</label>
                <input 
                  v-model="edu.institution" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Universidade de Aveiro"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Grau *</label>
                <input 
                  v-model="edu.degree" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Licenciatura"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Área *</label>
                <input 
                  v-model="edu.field" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engenharia Informática"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Ano Conclusão *</label>
                <input 
                  v-model="edu.endDate" 
                  type="month" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <p v-if="formData.education.length === 0" class="text-gray-500 text-center py-4">
            Nenhuma formação adicionada ainda
          </p>
        </div>


        <!-- Projetos -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">🎓 Projetos</h2>
            <button
              type="button"
              @click="addProject"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
            >
              ➕ Adicionar
            </button>
          </div>

          <div v-for="(edu, index) in formData.project" :key="index" class="mb-6 p-4 border rounded-lg">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold">Projeto {{ index + 1 }}</h3>
              <button
                type="button"
                @click="removeProject(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                🗑️ Remover
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Titulo *</label>
                <input 
                  v-model="edu.projectTitle" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titulo do Projeto"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Data Início *</label>
                <input 
                  v-model="exp.startDate" 
                  type="month" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Data Fim</label>
                <input 
                  v-model="exp.endDate" 
                  type="month"
                  :disabled="exp.isCurrentJob"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <label class="flex items-center mt-2 text-sm">
                  <input 
                    v-model="exp.isCurrentJob" 
                    type="checkbox"
                    class="mr-2"
                  />
                  Em desenvolvimento
                </label>
              </div>

              <div class="mt-4">
              <label class="block text-sm font-medium mb-2">Descrição *</label>
              <div class="relative">
                <textarea 
                  v-model="exp.description" 
                  rows="3"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreve as tuas responsabilidades e conquistas..."
                ></textarea>
                <button
                  type="button"
                  @click="improveDescriptionProject(index)"
                  :disabled="loadingAI"
                  class="absolute bottom-2 right-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {{ loadingAI ? '⏳' : '✨ Melhorar' }}
                </button>
              </div>
            </div>

            
            </div>
          </div>

          <p v-if="formData.education.length === 0" class="text-gray-500 text-center py-4">
            Nenhum projeto adicionado ainda
          </p>
        </div>

        <!-- Competências -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">🛠️ Competências</h2>
          
          <div class="mb-4">
            <div class="flex space-x-2">
              <input 
                v-model="newSkill" 
                type="text"
                @keyup.enter="addSkill"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Vue.js, Node.js, PostgreSQL..."
              />
              <button
                type="button"
                @click="addSkill"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Adicionar
              </button>
              <button
                type="button"
                @click="suggestSkills"
                :disabled="loadingAI"
                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50"
              >
                {{ loadingAI ? '⏳' : '✨ Sugerir' }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(skill, index) in formData.skills" 
              :key="index"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{{ skill }}</span>
              <button
                type="button"
                @click="removeSkill(index)"
                class="text-blue-600 hover:text-blue-800 font-bold"
              >
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

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import cvApi from '../api/cv'
import aiService from '../services/aiService'

const router = useRouter()

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experiences: [],
  education: [],
  skills: []
})

const newSkill = ref('')
const saving = ref(false)
const loadingAI = ref(false)

// Experiências
const addExperience = () => {
  formData.experiences.push({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false
  })
}

const removeExperience = (index) => {
  formData.experiences.splice(index, 1)
}

const improveDescription = async (index) => {
  const exp = formData.experiences[index]
  if (!exp.description || !exp.position || !exp.company) {
    alert('Preenche o cargo, empresa e descrição primeiro!')
    return
  }

  try {
    loadingAI.value = true
    const improved = await aiService.improveDescription(
      exp.description,
      exp.position,
      exp.company
    )
    formData.experiences[index].description = improved
  } catch (error) {
    console.error('Erro ao melhorar descrição:', error)
    alert('Erro ao melhorar descrição')
  } finally {
    loadingAI.value = false
  }
}

// Formação
const addEducation = () => {
  formData.education.push({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: ''
  })
}

const removeEducation = (index) => {
  formData.education.splice(index, 1)
}

// Projetos
const addProject = () => {
  formData.project.push({
    projectTitle: '',
    startDate: '',
    endDate: '',
    description: '',
  })
}

const removeProject = (index) => {
  formData.project.splice(index, 1)
}

const improveDescriptionProject = async (index) => {
  const exp = formData.experiences[index]
  if (!exp.projectTitle || !exp.description) {
    alert('Preenche o titulo« e descrição primeiro!')
    return
  }

  try {
    loadingAI.value = true
    const improved = await aiService.improveDescription(
      exp.description,
    )
    formData.experiences[index].description = improved
  } catch (error) {
    console.error('Erro ao melhorar descrição:', error)
    alert('Erro ao melhorar descrição')
  } finally {
    loadingAI.value = false
  }
}

// Competências
const addSkill = () => {
  if (newSkill.value.trim()) {
    formData.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (index) => {
  formData.skills.splice(index, 1)
}

const suggestSkills = async () => {
  if (formData.experiences.length === 0) {
    alert('Adiciona pelo menos uma experiência profissional primeiro!')
    return
  }

  try {
    loadingAI.value = true
    const targetPosition = formData.experiences[0].position || 'Profissional'
    const suggested = await aiService.suggestSkills(targetPosition, formData.experiences)
    
    // Adicionar apenas skills que ainda não existem
    suggested.forEach(skill => {
      if (!formData.skills.includes(skill)) {
        formData.skills.push(skill)
      }
    })
  } catch (error) {
    console.error('Erro ao sugerir competências:', error)
    alert('Erro ao sugerir competências')
  } finally {
    loadingAI.value = false
  }
}

const generateSummary = async () => {
  if (!formData.fullName || formData.experiences.length === 0 || formData.skills.length === 0) {
    alert('Preenche nome, experiências e competências primeiro!')
    return
  }

  try {
    loadingAI.value = true
    const targetPosition = formData.experiences[0].position || 'Profissional'
    const summary = await aiService.generateSummary(
      formData.fullName,
      targetPosition,
      formData.experiences,
      formData.skills
    )
    formData.summary = summary
  } catch (error) {
    console.error('Erro ao gerar resumo:', error)
    alert('Erro ao gerar resumo')
  } finally {
    loadingAI.value = false
  }
}

// Guardar CV
const handleSave = async () => {
  if (!formData.fullName || !formData.email || !formData.phone) {
    alert('Preenche todos os campos obrigatórios!')
    return
  }

  try {
    saving.value = true
    await cvApi.createCV(formData)
    alert('CV criado com sucesso! ✅')
    router.push('/dashboard')
  } catch (error) {
    console.error('Erro ao criar CV:', error)
    alert('Erro ao criar CV')
  } finally {
    saving.value = false
  }
}
</script>