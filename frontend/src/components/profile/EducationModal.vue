<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6">{{ education ? 'Editar Educação' : 'Adicionar Educação' }}</h2>

      <div class="space-y-4">
        <!-- Grau Académico -->
        <div>
          <label class="block text-sm font-medium mb-2">Grau Académico *</label>
          <input v-model="localEducation.degree" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" required />
        </div>

        <!-- Instituição -->
        <div>
          <label class="block text-sm font-medium mb-2">Instituição *</label>
          <input v-model="localEducation.institution" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" required />
        </div>

        <!-- Área de Estudo -->
        <div>
          <label class="block text-sm font-medium mb-2">Área de Estudo</label>
          <input v-model="localEducation.fieldOfStudy" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
        </div>

        <!-- Datas -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Data Início *</label>
            <input v-model="localEducation.startDate" type="date" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Data Fim</label>
            <input v-model="localEducation.endDate" type="date" :disabled="localEducation.isCurrent" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50" />
          </div>
        </div>

        <!-- Checkbox Atual -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="localEducation.isCurrent" class="w-4 h-4" />
            <span class="text-sm">Ainda estou a estudar</span>
          </label>
        </div>

        <!-- Nota -->
        <div>
          <label class="block text-sm font-medium mb-2">Nota</label>
          <input v-model="localEducation.grade" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium mb-2">Descrição</label>
          <textarea v-model="localEducation.description" rows="4" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"></textarea>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('save', localEducation)" class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
          Guardar
        </button>
        <button @click="$emit('close')" class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    education: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      localEducation: this.education
        ? { ...this.education }
        : {
            degree: '',
            institution: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            grade: '',
            description: ''
          }
    }
  }
}
</script>
