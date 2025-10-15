<template>
    <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div class="px-8 py-4 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold">{{ sectionTitle }}</h1>
                <p class="text-sm text-slate-400">{{ sectionSubtitle }}</p>
            </div>
            <div class="flex flex-row gap-4">
                <div class="flex items-center gap-4">
                    <button class="p-2 hover:bg-slate-800 rounded-lg transition-all relative">
                        <span class="text-2xl">🔔</span>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <router-link to="/upgrade"
                        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                        Upgrade Pro
                    </router-link>
                </div>
                <!-- User Info -->
                <div class=" p-6 border-slate-800">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {{ userInitials }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium truncate">{{ userName }}</div>
                            <div class="text-xs text-slate-500">{{ userPlan }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useUserStore } from '../../stores/user';
import { ref, computed, onMounted, watch } from "vue";

const userStore = useUserStore();

// Estado reativo
const userName = ref('');
const userInitials = ref('');
const userPlan = ref('');

// Função para atualizar dados do usuário
const updateUserData = () => {
  if (!userStore.user) return;

  userName.value = userStore.user.name ?? 'Sem Nome';
  userPlan.value = userStore.user.userPlan ?? 'FREE';
  userInitials.value = userStore.user.name
    ? userStore.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'U';
};

// Buscar dados do usuário ao montar o componente
onMounted(async () => {
  await userStore.getMe();
  updateUserData();
  console.log(userStore.user);
});

// Atualizar automaticamente caso o usuário seja alterado
watch(() => userStore.user, () => {
  updateUserData();
});

const props = defineProps<{ activeSection: string }>();

// Computed properties para títulos e subtítulos
const sectionTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    "create-cv": "Criar Novo CV",
    "my-cvs": "Meus CVs",
    "ai-review": "AI Review",
    "job-match": "Job Match",
    "career-copilot": "Career Copilot",
    templates: "Templates",
    settings: "Definições"
  };
  return titles[props.activeSection] || "Dashboard";
});

const sectionSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    dashboard: "Visão geral da tua conta",
    "create-cv": "Cria um CV profissional em minutos",
    "my-cvs": "Gere todos os teus currículos",
    "ai-review": "Análise inteligente do teu CV",
    "job-match": "Adapta o CV para vagas específicas",
    "career-copilot": "Assistente pessoal de carreira",
    templates: "Escolhe o design perfeito",
    settings: "Configura a tua conta"
  };
  return subtitles[props.activeSection] || "";
});
</script>

