<template>
  <div class="space-y-6">
    <!-- Info Básica -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold mb-1">Informações Básicas</h2>
          <p class="text-slate-400 text-sm">Dados pessoais e de contacto</p>
        </div>
        <button v-if="!editingBasic" @click="startEdit()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
          Editar
        </button>
        <div v-else class="flex gap-2">
          <button @click="saveBasicInfo"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all">
            Guardar
          </button>
          <button @click="cancelEditBasic"
            class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
            Cancelar
          </button>
        </div>
      </div>

      <div v-if="!editingBasic" class="space-y-4">
        <div v-if="user" class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-sm text-slate-500">Nome</label>
            <p class="text-lg">{{ user?.name || 'Não definido' }}</p>
          </div>
          <div>
            <label class="text-sm text-slate-500">Email</label>
            <p class="text-lg">{{ user?.email }}</p>
          </div>
          <div v-if="profile">
            <label class="text-sm text-slate-500">Telefone</label>
            <p class="text-lg">{{ profile?.phone || 'Não definido' }}</p>
          </div>
          <div v-if="profile">
            <label class="text-sm text-slate-500">Localização</label>
            <p class="text-lg">{{ profile?.location || 'Não definido' }}</p>
          </div>
        </div>

        <div v-if="profile">
          <label class="text-sm text-slate-500">Headline</label>
          <p class="text-lg">{{ profile?.headline || 'Não definido' }}</p>
        </div>

        <div v-if="profile">
          <label class="text-sm text-slate-500">Sumário Profissional</label>
          <p class="text-slate-300 leading-relaxed">{{ profile?.summary || 'Não definido' }}</p>
        </div>

        <div v-if="profile" class="grid grid-cols-3 gap-6">
          <div>
            <label class="text-sm text-slate-500">Website</label>
            <p class="text-lg truncate ">{{ profile?.website || 'Não definido' }}</p>
          </div>
          <div>
            <label class="text-sm text-slate-500">LinkedIn</label>
            <p class="text-lg truncate ">{{ profile?.linkedin || 'Não definido' }}</p>
          </div>
          <div>
            <label class="text-sm text-slate-500">GitHub</label>
            <p class="text-lg truncate ">{{ profile?.github || 'Não definido' }}</p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nome</label>
            <p class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300">
              {{ user?.name || 'Não definido' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Telefone</label>
            <input v-model="editForm.phone" type="tel"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Localização</label>
          <input v-model="editForm.location" type="text"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Headline</label>
          <input v-model="editForm.headline" type="text" placeholder="Ex: Full Stack Developer | React & Node.js"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Sumário Profissional</label>
          <textarea v-model="editForm.summary" rows="4"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"></textarea>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Website</label>
            <input v-model="editForm.website" type="url"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">LinkedIn</label>
            <input v-model="editForm.linkedin" type="text" placeholder="linkedin.com/in/..."
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">GitHub</label>
            <input v-model="editForm.github" type="text" placeholder="github.com/..."
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useProfileStore } from '../../stores/profile'

export default {
  name: 'ProfileBasic',

  data() {
    return {
      // Estados locais
      editingBasic: false,

      // Formulário temporário
      editForm: {
        phone: '',
        location: '',
        headline: '',
        summary: '',
        website: '',
        linkedin: '',
        github: ''
      },
    }
  },

  computed: {
    profileStore() {
      return useProfileStore()
    },
    user() {
      return this.profileStore.user
    },
    profile() {
      return this.profileStore.profile
    }
  },

  methods: {
    startEdit() {
      this.editingBasic = true
      if (this.profileStore.profile) {
        Object.assign(this.editForm, this.profileStore.profile)
      }
    },

    cancelEditBasic() {
      this.editingBasic = false
      Object.assign(this.editForm, this.profileStore.profile || {})
    },

    async saveBasicInfo() {
      const res = await this.profileStore.updateProfile(this.editForm)
      if (res.success) {
        // Atualiza o perfil local com o que veio da store
        this.profile = this.profileStore.profile
        this.editingBasic = false

      } else {
        alert(res.message || 'Erro ao atualizar perfil')
      }
    },
  }

}
</script>