<!-- frontend/src/views/Register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center mb-6">Criar Conta</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Nome Completo</label>
          <input 
            v-model="name" 
            type="text" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="João Silva"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="joao@example.com"
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Mínimo 6 caracteres"
            minlength="6"
          />
        </div>
        
        <button 
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ loading ? 'A criar conta...' : 'Registar' }}
        </button>
        
        <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm mt-4 text-center">Conta criada! ✅</p>
      </form>
      
      <p class="text-center mt-4 text-sm">
        Já tens conta? 
        <router-link to="/login" class="text-blue-600 hover:underline">Entrar</router-link>
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

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = false
    
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    success.value = true
    
    // Redirecionar após 1 segundo
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
    
  } catch (err) {
    error.value = err.error || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>