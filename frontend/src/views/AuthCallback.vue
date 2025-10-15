<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
    <div class="bg-white shadow-lg rounded-2xl p-8 w-80">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">
        A autenticar com o Google...
      </h2>
      <p class="text-gray-500 text-sm">Por favor, aguarde um momento ⏳</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const store = useAuthStore();

onMounted(() => {
  const accessToken = route.query.accessToken as string;
  const refreshToken = route.query.refreshToken as string;
  const userData = route.query.user ? JSON.parse(route.query.user as string) : null;

  if (accessToken && refreshToken && userData) {
    // Guarda na store (e localStorage via Pinia persist)
    store.setSession(userData, accessToken, refreshToken);

    // Redireciona para o perfil
    router.replace('/profile');
  } else {
    // Se algo falhar, volta ao login
    router.replace('/login');
  }
});
</script>
