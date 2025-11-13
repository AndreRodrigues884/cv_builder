<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 px-4">
    <div class="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 w-full max-w-md">
      <h2 class="text-3xl font-semibold text-center text-slate-100 mb-6">
        Criar Conta
      </h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <input v-model="name" type="text" placeholder="Nome" required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
        </div>

        <div>
          <input v-model="email" type="email" placeholder="Email" required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
        </div>

        <div class="relative">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-10 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
          <button type="button" @click="togglePassword"
            class="absolute right-3 top-6 -translate-y-1/2 flex items-center text-slate-400 hover:text-slate-200 transition">
            <EyeIcon v-if="!showPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
          <p class="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
        </div>
        <!-- ERROR/SUCCESS MESSAGE -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {{ error }}
        </div>
        <div v-if="success" class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
          {{ success }}
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Criando conta...' : 'Registar' }}
        </button>
      </form>

      <div class="flex items-center my-6">
        <div class="flex-1 h-px bg-slate-800"></div>
        <span class="px-2 text-slate-500 text-sm">ou</span>
        <div class="flex-1 h-px bg-slate-800"></div>
      </div>

      <button @click="googleLogin"
        class="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 py-3 rounded-lg font-medium transition">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
          <path fill="#EA4335"
            d="M24 9.5c3.54 0 6.63 1.22 9.1 3.22l6.77-6.77C35.64 2.71 30.15 0 24 0 14.75 0 6.68 5.46 2.69 13.39l7.91 6.14C12.13 13.49 17.63 9.5 24 9.5z" />
          <path fill="#34A853"
            d="M46.1 24.49c0-1.57-.14-3.09-.39-4.56H24v9.11h12.45c-.55 2.86-2.21 5.28-4.69 6.93l7.27 5.64c4.26-3.94 6.97-9.74 6.97-17.12z" />
          <path fill="#4A90E2"
            d="M9.6 28.53A14.48 14.48 0 019.5 24c0-1.57.27-3.07.74-4.47l-7.91-6.14A23.92 23.92 0 000 24c0 3.89.93 7.57 2.59 10.83l7.01-6.3z" />
          <path fill="#FBBC05"
            d="M24 48c6.48 0 11.92-2.13 15.9-5.79l-7.27-5.64c-2.01 1.35-4.57 2.16-8.63 2.16-6.37 0-11.87-4-13.41-9.54l-7.91 6.14C6.68 42.54 14.75 48 24 48z" />
        </svg>
        Registar com Google
      </button>

      <p class="text-center text-slate-400 text-sm mt-6">
        Já tens conta?
        <RouterLink to="/login" class="text-blue-500 hover:text-blue-400 font-medium">
          Inicia sessão
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'


export default {
  name: 'Register',

  components: {
    EyeIcon,
    EyeSlashIcon
  },

  data() {
    return {
      name: '',
      email: '',
      password: '',
      loading: false,
      showPassword: false,
      error: '',
      success: ''
    }
  },

  created() {
    this.authStore = useAuthStore();
    this.router = useRouter();
  },

  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },

    async handleRegister() {
      try {
        this.loading = true;
        this.error = '';
        this.success = '';

        await this.authStore.register(this.name, this.email, this.password);

        this.success = 'Conta criada com sucesso! Redirecionando...';

        setTimeout(() => {
          this.router.push('/dashboard');
        }, 1500);

      } catch (err) {
        console.error('Register error:', err);
        this.error = err.response?.data?.message || 'Erro ao criar conta. Tenta novamente.';
      } finally {
        this.loading = false;
      }
    },

    googleLogin() {
      this.authStore.$reset();
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      window.location.href = `${backendUrl}/auth/google`;
    }
  }

}
</script>