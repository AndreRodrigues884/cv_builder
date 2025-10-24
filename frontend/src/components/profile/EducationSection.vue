<template>
    <!-- Educação -->
    <div class="space-y-6">
        <!-- Conteúdo -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold mb-1">Formação Académica</h2>
                    <p class="text-slate-400 text-sm">As tuas qualificações académicas</p>
                </div>
                <button @click="showAddEducation = true"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                    + Adicionar
                </button>
            </div>

            <!-- Verifica se profile existe -->
            <div v-if="profileStore.profile">
                <!-- Lista de formações -->
                <div v-if="profileStore.profile.educations?.length > 0" class="space-y-4">
                    <div v-for="edu in profileStore.profile.educations" :key="edu.id"
                        class="bg-slate-800 border border-slate-700 rounded-xl p-6 break-words">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-bold break-words">{{ edu?.degree }}</h3>
                                <p class="text-blue-400 truncate w-full" :title="edu.institution">{{ edu?.institution }}
                                </p>
                                <p class="text-sm text-slate-500">{{ edu?.fieldOfStudy }}</p>
                                <p class="text-sm text-slate-500">
                                    {{ formatDate(edu?.startDate) }} - {{ edu?.isCurrent ? 'Atual' :
                                        formatDate(edu?.endDate) }}
                                </p>
                                <p v-if="edu.grade" class="text-sm text-slate-500">Nota: {{ edu?.grade }}</p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="editEducation(edu)"
                                    class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                                <button @click="deleteEducation(edu.id)"
                                    class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                            </div>
                        </div>
                        <p v-if="edu.description" class="text-slate-300 break-words">{{ edu?.description }}</p>
                    </div>
                </div>

                <!-- Nenhuma educação -->
                <div v-else class="text-center py-12 text-slate-500">
                    <p class="text-lg mb-2">Ainda não tens formações adicionadas</p>
                    <p class="text-sm">Clica em "Adicionar" para começar</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Adicionar/Editar Educação -->
    <div v-if="showAddEducation"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold mb-6">{{ editingEducation ? 'Editar Educação' : 'Adicionar Educação' }}</h2>

            <div class="space-y-4">
                <!-- Grau -->
                <div>
                    <label class="block text-sm font-medium mb-2">Grau Académico *</label>
                    <input v-model="newEducation.degree" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        required>
                </div>

                <!-- Instituição -->
                <div>
                    <label class="block text-sm font-medium mb-2">Instituição *</label>
                    <input v-model="newEducation.institution" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        required>
                </div>

                <!-- Área de estudo -->
                <div>
                    <label class="block text-sm font-medium mb-2">Área de Estudo</label>
                    <input v-model="newEducation.fieldOfStudy" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- Datas -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Data Início *</label>
                        <input v-model="newEducation.startDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                            required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Data Fim</label>
                        <input v-model="newEducation.endDate" type="date" :disabled="newEducation.isCurrent"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none disabled:opacity-50">
                    </div>
                </div>

                <!-- Checkbox Atual -->
                <div>
                    <label class="flex items-center gap-2">
                        <input v-model="newEducation.isCurrent" type="checkbox" class="w-4 h-4">
                        <span class="text-sm">Ainda estou a estudar</span>
                    </label>
                </div>

                <!-- Nota -->
                <div>
                    <label class="block text-sm font-medium mb-2">Nota</label>
                    <input v-model="newEducation.grade" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                </div>

                <!-- Descrição -->
                <div>
                    <label class="block text-sm font-medium mb-2">Descrição</label>
                    <textarea v-model="newEducation.description" rows="4"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"></textarea>
                </div>
            </div>

            <!-- Botões -->
            <div class="flex gap-3 mt-6">
                <button @click="saveEducation"
                    class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
                    Guardar
                </button>
                <button @click="showAddEducation = false; resetEducationForm()"
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
    name: 'ProfileEducation',

    data() {
        return {
            /* Education */
            showAddEducation: false,
            newEducation: {
                degree: '',
                institution: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                grade: '',
                description: '',
            },
            editingEducationId: null,
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
        formatDate(date) {
            if (!date) return '-'
            return new Date(date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'short'
            })
        },

        async saveEducation() {
            let res;
            if (this.editingEducationId) {
                res = await this.profileStore.updateEducation(this.editingEducationId, this.newEducation)
            } else {
                res = await this.profileStore.addEducation(this.newEducation)
            }

            if (res.success) {
                this.showAddEducation = false
                this.resetEducationForm()
            } else {
                alert(res.message || 'Erro ao guardar formação')
            }
        },

        editEducation(edu) {
            this.editingEducationId = edu.id
            this.newEducation = { ...edu }
            this.showAddEducation = true
        },

        async deleteEducation(id) {
            const confirmDelete = confirm('Tem a certeza que quer apagar esta formação?')
            if (!confirmDelete) return

            const res = await this.profileStore.deleteEducation(id)
            if (!res.success) {
                alert(res.message || 'Erro ao apagar formação')
            }
        },

        resetEducationForm() {
            this.newEducation = {
                degree: '',
                institution: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                grade: '',
                description: '',
            }
            this.editingEducationId = null
        },
    }

}


</script>