<template>
    <!-- Skills -->
    <div class="space-y-6">
        <!-- Conteúdo -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold mb-1">Competências</h2>
                    <p class="text-slate-400 text-sm">As tuas skills técnicas e soft skills</p>
                </div>
                <button @click="showAddSkill = true"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                    + Adicionar
                </button>
            </div>

            <!-- Verifica se profile existe -->
            <div v-if="profileStore.profile">
                <!-- Lista de skills -->
                <div v-if="profileStore.profile.skills?.length > 0" class="space-y-4">
                    <div v-for="skill in profileStore.profile.skills" :key="skill.id"
                        class="bg-slate-800 border border-slate-700 rounded-xl p-6 break-words">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="text-lg font-bold break-words">{{ skill?.name }}</h3>
                                <p class="text-sm text-slate-500">Categoria: {{ skill?.category }}</p>
                                <p class="text-sm text-slate-500">Nível: {{ '⭐'.repeat(skill?.level) }}</p>
                                <p v-if="skill.yearsOfExp" class="text-sm text-slate-500">Experiência: {{
                                    skill?.yearsOfExp }} anos
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="editSkill(skill)"
                                    class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                                <button @click="deleteSkill(skill.id)"
                                    class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nenhuma skill -->
                <div v-else class="text-center py-12 text-slate-500">
                    <p class="text-lg mb-2">Ainda não tens competências adicionadas</p>
                    <p class="text-sm">Clica em "Adicionar" para começar</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Adicionar/Editar Skill -->
    <div v-if="showAddSkill"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h2 class="text-2xl font-bold mb-6">{{ editingSkillId ? 'Editar Competência' : 'Adicionar Competência' }}
            </h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Nome *</label>
                    <input v-model="newSkill.name" type="text"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                        required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Categoria</label>
                    <select v-model="newSkill.category"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Design">Design</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Nível (1-5)</label>
                    <input v-model.number="newSkill.level" type="number" min="1" max="5"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Anos de Experiência</label>
                    <input v-model.number="newSkill.yearsOfExp" type="number" min="0"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Botões -->
            <div class="flex gap-3 mt-6">
                <button @click="saveSkill"
                    class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
                    Guardar
                </button>
                <button @click="showAddSkill = false; resetSkillForm()"
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
            /* Skills */
            showAddSkill: false,
            newSkill: {
                name: '',
                category: 'Frontend',
                level: 3,
                yearsOfExp: 0,
            },
            editingSkillId: null,
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

        async saveSkill() {
            let res;
            if (this.editingSkillId) {
                res = await this.profileStore.updateSkill(this.editingSkillId, this.newSkill)
            } else {
                res = await this.profileStore.addSkill(this.newSkill)
            }

            if (res.success) {
                this.showAddSkill = false
                this.resetSkillForm()
            } else {
                alert(res.message || 'Erro ao guardar competência')
            }
        },

        editSkill(skill) {
            this.editingSkillId = skill.id
            this.newSkill = { ...skill }
            this.showAddSkill = true
        },

        async deleteSkill(id) {
            const confirmDelete = confirm('Tem a certeza que quer apagar esta competência?')
            if (!confirmDelete) return

            const res = await this.profileStore.deleteSkill(id)
            if (!res.success) {
                alert(res.message || 'Erro ao apagar competência')
            }
        },

        resetSkillForm() {
            this.newSkill = {
                name: '',
                category: 'Frontend',
                level: 3,
                yearsOfExp: 0,
            }
            this.editingSkillId = null
        },
    }
}
</script>