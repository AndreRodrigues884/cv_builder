<!-- frontend/src/views/Home.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        CV Builder 🚀
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Cria o teu currículo profissional com ajuda de IA
      </p>
      <div class="space-x-4">
        <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Começar Agora
        </button>
        <button class="px-6 py-3 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
          Ver Exemplo
        </button>
      </div>
      
      <!-- Status do Backend -->
      <div class="mt-12">
        <p class="text-sm text-gray-500 mb-2">Status do Backend:</p>
        <div class="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span class="text-sm font-medium">{{ backendStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const backendStatus = ref('Verificando...')

onMounted(async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/health`)
    backendStatus.value = '✅ Online'
    console.log('Backend response:', response.data)
  } catch (error) {
    backendStatus.value = '❌ Offline'
    console.error('Backend error:', error)
  }
})
</script>