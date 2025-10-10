<!-- frontend/src/views/Dashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-800">CV Builder</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
            <button 
              @click="handleLogout"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Os Meus CVs</h2>
          <p class="text-gray-600 mt-1">Gere e edita os teus currículos</p>
        </div>
        <router-link to="/cv/create">
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
            <span>➕</span>
            <span>Criar Novo CV</span>
          </button>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-4">A carregar CVs...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="cvs.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📄</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Ainda não tens CVs</h3>
        <p class="text-gray-600 mb-6">Cria o teu primeiro currículo profissional agora!</p>
        <router-link to="/cv/create">
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Criar Primeiro CV
          </button>
        </router-link>
      </div>

      <!-- CVs Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="cv in cvs" 
          :key="cv.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ cv.fullName }}</h3>
              <p class="text-sm text-gray-600">{{ cv.email }}</p>
            </div>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {{ cv.aiImproved ? '✨ IA' : '📝' }}
            </span>
          </div>

          <p v-if="cv.summary" class="text-sm text-gray-700 mb-4 line-clamp-3">
            {{ cv.summary }}
          </p>

          <div class="flex items-center text-xs text-gray-500 mb-4">
            <span>📅 {{ formatDate(cv.updatedAt) }}</span>
          </div>

          <div class="flex space-x-2">
            <router-link :to="`/cv/${cv.id}/edit`" class="flex-1">
              <button class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm">
                ✏️ Editar
              </button>
            </router-link>
            <button 
              @click="downloadPDF(cv.id)"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
            >
              📥 PDF
            </button>
            <button 
              @click="confirmDelete(cv.id)"
              class="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="deleteModalOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="deleteModalOpen = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 class="text-lg font-bold mb-4">Confirmar Eliminação</h3>
        <p class="text-gray-600 mb-6">Tens a certeza que queres eliminar este CV? Esta ação não pode ser revertida.</p>
        <div class="flex space-x-3">
          <button 
            @click="deleteModalOpen = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button 
            @click="handleDelete"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import cvService from '../services/cvService'
import axios from 'axios'

const authStore = useAuthStore()
const router = useRouter()

const cvs = ref([])
const loading = ref(true)
const deleteModalOpen = ref(false)
const cvToDelete = ref(null)

onMounted(async () => {
  await loadCVs()
})

const loadCVs = async () => {
  try {
    loading.value = true
    cvs.value = await cvService.getUserCVs()
  } catch (error) {
    console.error('Erro ao carregar CVs:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const downloadPDF = async (cvId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/pdf/${cvId}/download`,
      { 
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
    )
    
    // Criar link de download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cv-${cvId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
    alert('Erro ao gerar PDF')
  }
}

const confirmDelete = (cvId) => {
  cvToDelete.value = cvId
  deleteModalOpen.value = true
}

const handleDelete = async () => {
  try {
    await cvService.deleteCV(cvToDelete.value)
    cvs.value = cvs.value.filter(cv => cv.id !== cvToDelete.value)
    deleteModalOpen.value = false
    cvToDelete.value = null
  } catch (error) {
    console.error('Erro ao eliminar CV:', error)
    alert('Erro ao eliminar CV')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>

</style>