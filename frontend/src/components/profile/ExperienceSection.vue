<template>
    <!-- Experience -->
    <div class="space-y-6">
        <!-- Conteúdo -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold mb-1">Experiência Profissional</h2>
                    <p class="text-slate-400 text-sm">Adiciona as tuas experiências de trabalho</p>
                </div>
                <button @click="showAddExperience = true"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                    + Adicionar
                </button>
            </div>

            <!-- Verifica se profile existe -->
            <div v-if="profileStore.profile">
                <!-- Lista de experiências -->
                <div v-if="profileStore.profile.experiences?.length > 0" class="space-y-4">
                    <div v-for="exp in profileStore.profile.experiences" :key="exp.id"
                        class="bg-slate-800 border border-slate-700 rounded-xl p-6 break-words">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-bold break-words">{{ exp?.jobTitle }}</h3>
                                <p class="text-blue-400 truncate w-full" :title="exp.company">{{ exp?.company }}</p>
                                <p class="text-sm text-slate-500">
                                    {{ formatDate(exp?.startDate) }} - {{ exp?.isCurrent ? 'Atual' :
                                        formatDate(exp?.endDate) }}
                                </p>
                                <p class="text-sm text-slate-500 truncate w-full" :title="exp.location">{{ exp?.location
                                }}</p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="editExperience(exp)"
                                    class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                                <button @click="deleteExperience(exp.id)"
                                    class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                            </div>
                        </div>
                        <p class="text-slate-300 mb-3 break-words">{{ exp?.description }}</p>
                    </div>
                </div>

                <!-- Nenhuma experiência -->
                <div v-else class="text-center py-12 text-slate-500">
                    <p class="text-lg mb-2">Ainda não tens experiências adicionadas</p>
                    <p class="text-sm">Clica em "Adicionar" para começar</p>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAddExperience"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold mb-6">{{ editingExperience ? 'Editar Experiência' : 'Adicionar Experiência' }}
            </h2>

            <div class="space-y-4">
                <!-- Cargo -->
                <div>
                    <label class="block text-sm font-medium mb-2">Cargo *</label>
                    <input v-model="newExperience.jobTitle" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        required>
                </div>

                <!-- Empresa -->
                <div>
                    <label class="block text-sm font-medium mb-2">Empresa *</label>
                    <input v-model="newExperience.company" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        required>
                </div>

                <!-- Localização -->
                <div>
                    <label class="block text-sm font-medium mb-2">Localização</label>
                    <input v-model="newExperience.location" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- Datas -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Data Início *</label>
                        <input v-model="newExperience.startDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                            required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Data Fim</label>
                        <input v-model="newExperience.endDate" type="date" :disabled="newExperience.isCurrent"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50">
                    </div>
                </div>

                <!-- Checkbox Atual -->
                <div>
                    <label class="flex items-center gap-2">
                        <input v-model="newExperience.isCurrent" type="checkbox" class="w-4 h-4">
                        <span class="text-sm">Trabalho aqui atualmente</span>
                    </label>
                </div>

                <!-- Descrição -->
                <div>
                    <label class="block text-sm font-medium mb-2">Descrição</label>
                    <textarea v-model="newExperience.description" rows="4"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"></textarea>
                </div>

            </div>

            <div class="flex gap-3 mt-6">
                <button @click="saveExperience"
                    class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
                    Guardar
                </button>
                <button @click="showAddExperience = false; resetNewExperience()"
                    class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    Cancelar
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useProfileStore } from '../../stores/profile'

export default {
    name: 'ProfileExperience',

    data() {
        return {

            /* Experiences */
            showAddExperience: false,
            newExperience: {
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                description: '',
            },
            editingExperience: null, // guarda a experiência a editar
        }
    },
    computed: {
        profileStore() {
            return useProfileStore()
        },
        profile() {
            return this.profileStore.profile
        }
    },

    methods: {
        // Adicionar experiência
        async saveExperience() {
            if (this.editingExperience) {
                // Editando
                const res = await this.profileStore.updateExperience(
                    this.editingExperience.id,
                    this.newExperience
                )
                if (res.success) {
                    this.showAddExperience = false
                    this.editingExperience = null
                } else {
                    alert(res.message || 'Erro ao atualizar experiência')
                }
            } else {
                // Nova
                const res = await this.profileStore.addExperience(this.newExperience)
                if (res.success) {
                    this.showAddExperience = false
                    this.resetNewExperience()
                } else {
                    alert(res.message || 'Erro ao adicionar experiência')
                }
            }
        },

        resetNewExperience() {
            this.newExperience = {
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                description: '',
            }
        },

        // Editar experiência
        editExperience(exp) {
            this.editingExperience = exp
            this.newExperience = { ...exp }
            this.showAddExperience = true
        },

        // Apagar experiência
        async deleteExperience(id) {
            if (!confirm('Tem a certeza que deseja apagar esta experiência?')) return
            const res = await this.profileStore.deleteExperience(id)
            if (!res.success) alert(res.message || 'Erro ao apagar experiência')
        },

        formatDate(date) {
            if (!date) return '-'
            return new Date(date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'short'
            })
        },
    }
}
</script>