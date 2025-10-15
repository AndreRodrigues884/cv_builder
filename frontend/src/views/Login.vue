<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h2 class="text-3xl font-semibold text-center text-gray-800 mb-6">
        Iniciar Sessão
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition cursor-pointer"
        >
          Entrar
        </button>
      </form>

      <div class="flex items-center my-6">
        <div class="flex-1 h-px bg-gray-300"></div>
        <span class="px-2 text-gray-400 text-sm">ou</span>
        <div class="flex-1 h-px bg-gray-300"></div>
      </div>

      <button
        @click="googleLogin"
        class="w-full flex items-center justify-center gap-2 text-blue py-2 rounded-lg font-medium transition cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          class="w-5 h-5"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.63 1.22 9.1 3.22l6.77-6.77C35.64 2.71 30.15 0 24 0 14.75 0 6.68 5.46 2.69 13.39l7.91 6.14C12.13 13.49 17.63 9.5 24 9.5z"
          />
          <path
            fill="#34A853"
            d="M46.1 24.49c0-1.57-.14-3.09-.39-4.56H24v9.11h12.45c-.55 2.86-2.21 5.28-4.69 6.93l7.27 5.64c4.26-3.94 6.97-9.74 6.97-17.12z"
          />
          <path
            fill="#4A90E2"
            d="M9.6 28.53A14.48 14.48 0 019.5 24c0-1.57.27-3.07.74-4.47l-7.91-6.14A23.92 23.92 0 000 24c0 3.89.93 7.57 2.59 10.83l7.01-6.3z"
          />
          <path
            fill="#FBBC05"
            d="M24 48c6.48 0 11.92-2.13 15.9-5.79l-7.27-5.64c-2.01 1.35-4.57 2.16-8.63 2.16-6.37 0-11.87-4-13.41-9.54l-7.91 6.14C6.68 42.54 14.75 48 24 48z"
          />
        </svg>
        Entrar com Google
      </button>

      <p class="text-center text-gray-500 text-sm mt-6">
        Ainda não tens conta?
        <RouterLink to="/register" class="text-blue-600 hover:underline"
          >Regista-te</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const store = useAuthStore();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await store.login(email.value, password.value);
    alert('Login efetuado com sucesso!');
    router.push('/dashboard');
  } catch (err: any) {
    alert(err.response?.data?.error || 'Erro ao efetuar login.');
  }
};

const googleLogin = () => {
  store.$reset();
  window.location.href = 'http://localhost:5000/api/auth/google';
};
</script>