<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6">{{ experience ? 'Editar Experiência' : 'Adicionar Experiência' }}</h2>

      <div class="space-y-4">
        <div>
          <label>Cargo *</label>
          <input v-model="localExperience.jobTitle" type="text" class="input" />
        </div>
        <div>
          <label>Empresa *</label>
          <input v-model="localExperience.company" type="text" class="input" />
        </div>
        <div>
          <label>Localização</label>
          <input v-model="localExperience.location" type="text" class="input" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Data Início *</label>
            <input v-model="localExperience.startDate" type="date" class="input" />
          </div>
          <div>
            <label>Data Fim</label>
            <input v-model="localExperience.endDate" type="date" :disabled="localExperience.isCurrent" class="input" />
          </div>
        </div>
        <div>
          <label>
            <input type="checkbox" v-model="localExperience.isCurrent" /> Trabalho aqui atualmente
          </label>
        </div>
        <div>
          <label>Descrição</label>
          <textarea v-model="localExperience.description" class="input"></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button @click="$emit('save', localExperience)" class="btn btn-primary">Guardar</button>
        <button @click="$emit('close')" class="btn btn-secondary">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['experience'],
  data() {
    return {
      localExperience: this.experience ? { ...this.experience } : {
        jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '', achievements: [], skills: []
      }
    }
  }
}
</script>
