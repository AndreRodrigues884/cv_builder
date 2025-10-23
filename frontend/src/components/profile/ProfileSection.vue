<template>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold mb-1">{{ title }}</h2>
        <p class="text-slate-400 text-sm">{{ subtitle }}</p>
      </div>
      <div v-if="!editing">
        <button @click="$emit('edit')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
          Editar
        </button>
      </div>
      <div v-else class="flex gap-2">
        <button @click="$emit('save')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all">
          Guardar
        </button>
        <button @click="$emit('cancel')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all">
          Cancelar
        </button>
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    subtitle: String,
    editing: Boolean
  }
}
</script>
