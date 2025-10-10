<!-- frontend/src/views/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button 
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ loading ? 'A entrar...' : 'Entrar' }}
        </button>
        
        <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm mt-4 text-center">Login com sucesso! ✅</p>
      </form>
      
      <p class="text-center mt-4 text-sm">
        Não tens conta? 
        <router-link to="/register" class="text-blue-600 hover:underline">Registar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = false
    
    await authStore.login({
      email: email.value,
      password: password.value
    })
    
    success.value = true
    
    // Redirecionar após 1 segundo
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
    
  } catch (err) {
    error.value = err.error || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>