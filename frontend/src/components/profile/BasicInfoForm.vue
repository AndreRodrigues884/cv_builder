<template>
  <div class="space-y-4">
    <div>
      <label>Telefone</label>
      <input v-model="modelValue.phone" type="text" class="input" />
    </div>
    <div>
      <label>Localização</label>
      <input v-model="modelValue.location" type="text" class="input" />
    </div>
    <div>
      <label>Resumo</label>
      <textarea v-model="modelValue.summary" class="input"></textarea>
    </div>
    <div>
      <label>Website</label>
      <input v-model="modelValue.website" type="text" class="input" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Object,
    userName: String
  },
  emits: ['update:modelValue']
}
</script>
