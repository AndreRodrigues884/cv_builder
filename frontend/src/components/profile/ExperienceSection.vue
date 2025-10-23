<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold mb-1">Experiência Profissional</h2>
        <p class="text-slate-400 text-sm">Adiciona as tuas experiências de trabalho</p>
      </div>
      <button @click="$emit('add-experience')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
        + Adicionar
      </button>
    </div>

    <div v-if="experiences.length > 0" class="space-y-4">
      <div v-for="exp in experiences" :key="exp.id" class="bg-slate-800 p-6 rounded-xl">
        <div class="flex justify-between">
          <div>
            <h3 class="font-bold">{{ exp.jobTitle }}</h3>
            <p class="text-blue-400">{{ exp.company }}</p>
            <p class="text-sm">{{ formatDate(exp.startDate) }} - {{ exp.isCurrent ? 'Atual' : formatDate(exp.endDate) }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="$emit('edit-experience', exp)">✏️</button>
            <button @click="$emit('delete-experience', exp.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-slate-500 py-12">
      <p>Ainda não tens experiências adicionadas</p>
    </div>
  </div>
</template>

<script>
import { useProfileStore } from '../../stores/profile'
import { computed } from 'vue'

export default {
  name: 'ExperienceSection',
  setup() {
    const profileStore = useProfileStore()

    const experiences = computed(() => profileStore.profile?.experiences || [])

    // Função de formatação de datas
    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'short' })
    }

    return {
      experiences,
      formatDate
    }
  }
}
</script>
