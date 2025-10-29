<template>
    <div v-if="activeSection === 'my-cvs'">
        <!-- Cabeçalho e filtros -->
        <div class="flex justify-between items-center mb-6">
            <div class="flex gap-4">
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                    Todos ({{ stats.total || 0 }})
                </button>
                <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-all">
                    Publicados
                </button>
                <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-all">
                    Rascunhos
                </button>
            </div>
            <button @click="activeSection = 'create-cv'"
                class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">
                + Novo CV
            </button>
        </div>

        <!-- Lista de CVs -->
        <div v-if="allCVs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cv in allCVs" :key="cv.id"
                class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all group">
                <div
                    class="h-48 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center relative overflow-hidden">
                    <div class="text-center">
                        <div class="text-4xl mb-2">{{ cv.icon || '📄' }}</div>
                        <div class="text-sm text-slate-400">{{ cv.template || 'Moderno' }}</div>
                    </div>
                    <div class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all"></div>
                </div>
                <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="font-bold mb-1">{{ cv.title || 'Sem título' }}</h3>
                            <p class="text-sm text-slate-400">{{ cv.targetRole || 'Sem cargo' }}</p>
                        </div>
                        <span :class="cv.statusColor || 'bg-slate-700 text-slate-300'"
                            class="px-2 py-1 rounded text-xs font-semibold">
                            {{ cv.status || 'Rascunho' }}
                        </span>
                    </div>
                    <div class="text-xs text-slate-500 mb-4">
                        Atualizado {{ cv.updatedAt || 'recentemente' }}
                    </div>
                    <div class="flex gap-2">
                        <button @click="startEditCV(cv)"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium">
                            Editar
                        </button>
                        <button @click="downloadCV(cv)"
                            class="px-3 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all"
                            title="Descarregar CV">
                            ⬇
                        </button>
                        <button @click="deleteCV(cv)"
                            class="px-3 py-2 border border-red-700 text-red-400 rounded-lg hover:bg-red-900 transition-all"
                            title="Eliminar CV">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">📄</div>
            <h3 class="text-xl font-bold mb-2">Ainda não tens CVs</h3>
            <p class="text-slate-400 mb-6">Cria o teu primeiro CV profissional com IA</p>
            <button @click="activeSection = 'create-cv'"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">
                + Criar Primeiro CV
            </button>
        </div>
    </div>

    <!-- Seção de edição -->
    <div v-if="activeSection === 'edit-cv'" class="max-w-4xl mx-auto">
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between mb-6">
            <button @click="cancelEdit"
                class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <span>←</span>
                Voltar aos CVs
            </button>
            <div class="flex gap-3">
                <button @click="cancelEdit"
                    class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all font-medium">
                    Cancelar
                </button>
                <button @click="saveEditCV" :disabled="cvStore.loading"
                    class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium disabled:opacity-50">
                    {{ cvStore.loading ? 'A guardar...' : '💾 Guardar Alterações' }}
                </button>
            </div>
        </div>

        <!-- Título da Página -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div
                    class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                    ✏️
                </div>
                <div>
                    <h2 class="text-2xl font-bold">Editar CV</h2>
                    <p class="text-slate-400 text-sm">{{ editingCV?.title || 'Sem título' }}</p>
                </div>
            </div>
        </div>

        <!-- Formulário de Edição -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="space-y-6">
                <!-- Informações Básicas -->
                <div>
                    <h3 class="text-lg font-bold mb-4">📝 Informações Básicas</h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Título do CV</label>
                            <input v-model="editForm.title" type="text"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="Ex: CV para Google" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Cargo Alvo</label>
                            <input v-model="editForm.targetRole" type="text"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="Ex: Senior Full Stack Developer" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Template</label>
                            <select v-model="editForm.template"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white">
                                <option value="modern">Moderno</option>
                                <option value="classic">Clássico</option>
                                <option value="creative">Criativo</option>
                                <option value="executive">Executivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Dados Pessoais -->
                <div class="pt-6 border-t border-slate-800">
                    <h3 class="text-lg font-bold mb-4">👤 Dados Pessoais</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Nome Completo</label>
                            <input v-model="editForm.personalInfo.name" type="text"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="João Silva" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input v-model="editForm.personalInfo.email" type="email"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="joao@example.com" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Telefone</label>
                            <input v-model="editForm.personalInfo.phone" type="tel"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="+351 912 345 678" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Localização</label>
                            <input v-model="editForm.personalInfo.location" type="text"
                                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                                placeholder="Porto, Portugal" />
                        </div>
                    </div>
                </div>

                <!-- Sumário Profissional -->
                <div class="pt-6 border-t border-slate-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold">💼 Sumário Profissional</h3>
                        <button class="text-purple-500 text-sm hover:text-purple-400 flex items-center gap-1">
                            ✨ Melhorar com IA
                        </button>
                    </div>

                    <textarea v-model="editForm.summary" rows="4"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all text-white"
                        placeholder="Breve descrição sobre ti e tua experiência..."></textarea>
                </div>

                <!-- Experiência Profissional -->
                <div class="pt-6 border-t border-slate-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold">💼 Experiência Profissional</h3>
                        <button @click="addExperience" class="text-blue-500 text-sm hover:text-blue-400">+
                            Adicionar</button>
                    </div>

                    <div v-if="editForm.experiences.length === 0" class="text-center py-8 text-slate-400">
                        <p>Nenhuma experiência adicionada</p>
                        <button @click="addExperience" class="mt-3 text-blue-500 hover:text-blue-400">
                            + Adicionar primeira experiência
                        </button>
                    </div>

                    <div v-for="(exp, index) in editForm.experiences" :key="index"
                        class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-sm text-slate-400">Experiência #{{ index + 1 }}</span>
                            <button @click="editForm.experiences.splice(index, 1)"
                                class="text-red-400 hover:text-red-300 text-sm">
                                Remover
                            </button>
                        </div>

                        <div class="space-y-3">
                            <input v-model="exp.jobTitle" type="text" placeholder="Cargo"
                                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            <input v-model="exp.company" type="text" placeholder="Empresa"
                                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            <div class="grid grid-cols-2 gap-3">
                                <input v-model="exp.startDate" type="month" placeholder="Data Início"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                                <input v-model="exp.endDate" type="month" placeholder="Data Fim"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            </div>
                            <textarea v-model="exp.description" rows="3" placeholder="Descrição e conquistas..."
                                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white"></textarea>
                            <button class="text-purple-500 text-sm hover:text-purple-400">✨ Melhorar com IA</button>
                        </div>
                    </div>
                </div>

                <!-- Formação Académica -->
                <div class="pt-6 border-t border-slate-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold">🎓 Formação Académica</h3>
                        <button @click="addEducation" class="text-blue-500 text-sm hover:text-blue-400">+
                            Adicionar</button>
                    </div>

                    <div v-if="editForm.educations.length === 0" class="text-center py-8 text-slate-400">
                        <p>Nenhuma formação adicionada</p>
                        <button @click="addEducation" class="mt-3 text-blue-500 hover:text-blue-400">
                            + Adicionar primeira formação
                        </button>
                    </div>

                    <div v-for="(edu, index) in editForm.educations" :key="index"
                        class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-sm text-slate-400">Formação #{{ index + 1 }}</span>
                            <button @click="editForm.educations.splice(index, 1)"
                                class="text-red-400 hover:text-red-300 text-sm">
                                Remover
                            </button>
                        </div>

                        <div class="space-y-3">
                            <input v-model="edu.degree" type="text" placeholder="Grau"
                                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            <input v-model="edu.institution" type="text" placeholder="Instituição"
                                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            <div class="grid grid-cols-2 gap-3">
                                <input v-model="edu.startDate" type="month" placeholder="Data Início"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                                <input v-model="edu.endDate" type="month" placeholder="Data Fim"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Competências -->
                <div class="pt-6 border-t border-slate-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold">🎯 Competências</h3>
                        <button class="text-purple-500 text-sm hover:text-purple-400">✨ IA sugerir</button>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                        <span v-for="(skill, index) in editForm.skills" :key="index"
                            class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center gap-2">
                            {{ skill }}
                            <button @click="editForm.skills.splice(index, 1)" class="hover:text-red-400">×</button>
                        </span>
                    </div>

                    <div class="flex gap-2">
                        <input v-model="newSkill" @keyup.enter="addSkill" type="text"
                            placeholder="Adicionar competência..."
                            class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-white" />
                        <button @click="addSkill"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'

export default {
    name: 'MyCVs',

    data() {
        return {
            editingCV: null,
            activeSection: 'my-cvs',
            editForm: {
                title: '',
                targetRole: '',
                template: 'modern',
                personalInfo: { name: '', email: '', phone: '', location: '' },
                summary: '',
                experiences: [],
                educations: [],
                skills: [],
            },
            newSkill: '',
        }
    },

    computed: {
        cvStore() {
            return useCVStore()
        },

        allCVs() {
            return this.cvStore.cvs
        },

        stats() {
            return this.cvStore.stats
        }
    },

    async mounted() {
        if (!this.cvStore.cvs.length) {
            await this.cvStore.fetchCVs()
        }
    },

    methods: {
        startEditCV(cv) {
            console.log('📝 Editando CV:', cv)
            this.editingCV = cv

            // Preenche o formulário com valores existentes ou defaults
            this.editForm = {
                title: cv.title || '',
                targetRole: cv.targetRole || '',
                template: cv.template || 'modern',
                personalInfo: {
                    name: cv.personalInfo?.name || '',
                    email: cv.personalInfo?.email || '',
                    phone: cv.personalInfo?.phone || '',
                    location: cv.personalInfo?.location || '',
                },
                summary: cv.summary || '',
                experiences: cv.experiences ? JSON.parse(JSON.stringify(cv.experiences)) : [],
                educations: cv.educations ? JSON.parse(JSON.stringify(cv.educations)) : [],
                skills: cv.skills ? [...cv.skills] : [],
            }

            console.log('📋 Formulário preenchido:', this.editForm)
            this.activeSection = 'edit-cv'
        },

        addSkill() {
            if (this.newSkill.trim()) {
                this.editForm.skills.push(this.newSkill.trim())
                this.newSkill = ''
            }
        },

        // Adicionar experiência
        addExperience() {
            this.editForm.experiences.push({
                jobTitle: '',
                company: '',
                startDate: '',
                endDate: '',
                description: '',
                isCurrent: false,
            })
        },

        // Adicionar educação
        addEducation() {
            this.editForm.educations.push({
                degree: '',
                institution: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
            })
        },

        // Salvar edição - CORRIGIDO
        async saveEditCV() {
            if (!this.editingCV) return

            // Envia APENAS os dados do editForm
            const payload = {
                title: this.editForm.title,
                targetRole: this.editForm.targetRole,
                template: this.editForm.template,
                personalInfo: this.editForm.personalInfo,
                summary: this.editForm.summary,
                experiences: this.editForm.experiences,
                educations: this.editForm.educations,
                skills: this.editForm.skills,
            }

            console.log('📤 Enviando para API:', payload)

            const result = await this.cvStore.updateCV(this.editingCV.id, payload)

            if (result.success) {
                alert('✅ CV atualizado com sucesso!')
                this.activeSection = 'my-cvs'
                this.editingCV = null
                // Recarrega os CVs para ter os dados atualizados
                await this.cvStore.fetchCVs();
                this.cvs = [...this.cvStore.cvs];
            } else {
                alert('❌ Erro ao atualizar CV: ' + result.message)
            }
        },

        // Cancelar edição
        cancelEdit() {
            const hasChanges = JSON.stringify(this.editForm) !== JSON.stringify({
                title: this.editingCV?.title || '',
                targetRole: this.editingCV?.targetRole || '',
                template: this.editingCV?.template || 'modern',
                personalInfo: {
                    name: this.editingCV?.personalInfo?.name || '',
                    email: this.editingCV?.personalInfo?.email || '',
                    phone: this.editingCV?.personalInfo?.phone || '',
                    location: this.editingCV?.personalInfo?.location || '',
                },
                summary: this.editingCV?.summary || '',
                experiences: this.editingCV?.experiences || [],
                educations: this.editingCV?.educations || [],
                skills: this.editingCV?.skills || [],
            })

            if (hasChanges) {
                if (confirm('Tens certeza? Vais perder as alterações não guardadas.')) {
                    this.activeSection = 'my-cvs'
                    this.editingCV = null
                }
            } else {
                this.activeSection = 'my-cvs'
                this.editingCV = null
            }
        },

        async downloadCV(cv) {
            try {
                console.log('⬇️ Fazendo download do CV via store:', cv.id);

                // Mostra loading
                const loadingToast = this.$toast?.info('A gerar PDF...', { duration: false });

                // Chama a action da store
                const result = await this.cvStore.downloadCVPDF(cv.id);

                // Fecha o toast de loading
                if (loadingToast) loadingToast.dismiss();

                if (result.success) {
                    this.$toast?.success('✅ PDF baixado com sucesso!');
                    console.log('✅ Download concluído com sucesso');
                } else {
                    throw new Error(result.message || 'Erro ao descarregar PDF');
                }
            } catch (error) {
                console.error('❌ Erro ao fazer download:', error);
                this.$toast?.error('Erro ao fazer download do CV');
                alert('Erro ao fazer download do CV: ' + (error.message || 'Erro desconhecido'));
            }
        },

        async deleteCV(cv) {
            if (!cv || !cv.id) return;

            const confirmDelete = confirm(`🗑️ Tens a certeza que queres eliminar o CV "${cv.title}"?`);
            if (!confirmDelete) return;

            try {
                const result = await this.cvStore.deleteCV(cv.id);
                if (result.success) {
                    this.$toast?.success('✅ CV eliminado com sucesso!');
                    await this.cvStore.fetchCVs();
                    this.cvs = [...this.cvStore.cvs]; // atualiza lista local
                } else {
                    this.$toast?.error('❌ Erro ao eliminar CV');
                }
            } catch (error) {
                console.error('Erro ao eliminar CV:', error);
                this.$toast?.error('❌ Erro inesperado ao eliminar CV');
            }
        }

    }
}
</script>
