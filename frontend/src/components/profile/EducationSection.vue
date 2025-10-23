<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold mb-1">Formação Académica</h2>
        <p class="text-slate-400 text-sm">As tuas qualificações académicas</p>
      </div>
      <button @click="$emit('add-education')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
        + Adicionar
      </button>
    </div>

    <div v-if="$store.profileStore.profile?.educations?.length > 0" class="space-y-4">
      <div v-for="edu in $store.profileStore.profile.educations" :key="edu.id" class="bg-slate-800 p-6 rounded-xl">
        <div class="flex justify-between">
          <div>
            <h3 class="font-bold">{{ edu.degree }}</h3>
            <p class="text-blue-400">{{ edu.institution }}</p>
            <p class="text-sm">{{ edu.startDate }} - {{ edu.isCurrent ? 'Atual' : edu.endDate }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="$emit('edit-education', edu)">✏️</button>
            <button @click="$emit('delete-education', edu.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-slate-500 py-12">
      <p>Ainda não tens formações adicionadas</p>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['add-education', 'edit-education', 'delete-education']
}
</script>
