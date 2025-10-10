<!-- frontend/src/views/EditCV.vue -->
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
            <h1 class="text-xl font-bold text-gray-800">Editar CV</h1>
          </div>
          <div class="flex items-center">
            <button 
              @click="handleSave"
              :disabled="saving"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ saving ? 'A guardar...' : '💾 Guardar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Content (igual ao CreateCV.vue mas com formData preenchido) -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
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
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input 
                v-model="formData.email" 
                type="email" 
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Telefone *</label>
              <input 
                v-model="formData.phone" 
                type="tel" 
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Localização</label>
              <input 
                v-model="formData.location" 
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium mb-2">Resumo Profissional</label>
            <textarea 
              v-model="formData.summary" 
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <!-- Experiências (mesmo código do CreateCV) -->
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
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Empresa *</label>
                <input 
                  v-model="exp.company" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <!-- Formação (mesmo código do CreateCV) -->
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
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Grau *</label>
                <input 
                  v-model="edu.degree" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Área *</label>
                <input 
                  v-model="edu.field" 
                  type="text" 
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <!-- Competências (mesmo código do CreateCV) -->
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
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import cvService from '../services/cvService'
import aiService from '../services/aiService'

const router = useRouter()
const route = useRoute()

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
const loading = ref(true)
const loadingAI = ref(false)

onMounted(async () => {
  await loadCV()
})

const loadCV = async () => {
  try {
    loading.value = true
    const cv = await cvService.getCVById(route.params.id)
    
    // Preencher formData com dados do CV
    Object.assign(formData, cv)
  } catch (error) {
    console.error('Erro ao carregar CV:', error)
    alert('Erro ao carregar CV')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

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

// Guardar alterações
const handleSave = async () => {
  if (!formData.fullName || !formData.email || !formData.phone) {
    alert('Preenche todos os campos obrigatórios!')
    return
  }

  try {
    saving.value = true
    await cvService.updateCV(route.params.id, formData)
    alert('CV atualizado com sucesso! ✅')
    router.push('/dashboard')
  } catch (error) {
    console.error('Erro ao atualizar CV:', error)
    alert('Erro ao atualizar CV')
  } finally {
    saving.value = false
  }
}
</script>