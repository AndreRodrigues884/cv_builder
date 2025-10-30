<template>
    <div v-if="activeSection === 'my-cvs'">
        <!-- 🔹 Cabeçalho e filtros -->
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

        <!-- 🔹 Lista de CVs -->
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

                    <div class="text-xs text-slate-500 mb-4">Atualizado {{ cv.updatedAt || 'recentemente' }}</div>

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

        <!-- 🔹 Empty State -->
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

    <!-- ===================================== -->
    <!-- 🔧 SEÇÃO DE EDIÇÃO -->
    <!-- ===================================== -->
    <div v-if="activeSection === 'edit-cv'" class="max-w-5xl mx-auto">
        <!-- 🔹 Cabeçalho -->
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

        <!-- 🔹 Formulário -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8">
            <!-- 📝 Informações básicas -->
            <section>
                <h3 class="text-lg font-bold mb-4">📝 Informações Básicas</h3>
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm mb-2">Título</label>
                        <input v-model="editForm.title"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            placeholder="Ex: CV para Google" />
                    </div>
                    <div>
                        <label class="block text-sm mb-2">Cargo Alvo</label>
                        <input v-model="editForm.targetRole"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            placeholder="Ex: Backend Engineer" />
                    </div>
                </div>
            </section>

            <!-- 👤 Dados pessoais -->
            <section class="border-t border-slate-800 pt-6">
                <h3 class="text-lg font-bold mb-4">👤 Dados Pessoais</h3>
                <div class="grid md:grid-cols-2 gap-4">
                    <input v-model="editForm.personalInfo.name" placeholder="Nome completo" class="input" />
                    <input v-model="editForm.personalInfo.email" placeholder="Email" class="input" />
                    <input v-model="editForm.personalInfo.phone" placeholder="Telefone" class="input" />
                    <input v-model="editForm.personalInfo.location" placeholder="Localização" class="input" />
                    <input v-model="editForm.personalInfo.github" placeholder="GitHub" class="input" />
                    <input v-model="editForm.personalInfo.linkedin" placeholder="LinkedIn" class="input" />
                </div>
            </section>

            <!-- 💬 Sumário -->
            <section class="border-t border-slate-800 pt-6">
                <h3 class="text-lg font-bold mb-4">💬 Sumário Profissional</h3>
                <textarea v-model="editForm.summary" rows="4"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    placeholder="Resumo sobre tua experiência e objetivos..."></textarea>
            </section>

            <!-- 💼 Experiências -->
            <section class="border-t border-slate-800 pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">💼 Experiências</h3>
                    <button @click="addExperience" class="text-blue-500 hover:text-blue-400 text-sm">+
                        Adicionar</button>
                </div>

                <div v-for="(exp, i) in editForm.experiences" :key="i"
                    class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-400 text-sm">Experiência #{{ i + 1 }}</span>
                        <button @click="editForm.experiences.splice(i, 1)"
                            class="text-red-400 hover:text-red-300 text-sm">
                            Remover
                        </button>
                    </div>
                    <input v-model="exp.jobTitle" placeholder="Cargo" class="input" />
                    <input v-model="exp.company" placeholder="Empresa" class="input" />
                    <div class="grid grid-cols-2 gap-2">
                        <input v-model="exp.startDate" type="month" class="input" />
                        <input v-model="exp.endDate" type="month" class="input" />
                    </div>
                    <textarea v-model="exp.description" placeholder="Descrição..." rows="3" class="input"></textarea>
                </div>
            </section>

            <!-- 🎓 Educação -->
            <section class="border-t border-slate-800 pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">🎓 Formação Académica</h3>
                    <button @click="addEducation" class="text-blue-500 hover:text-blue-400 text-sm">+ Adicionar</button>
                </div>

                <div v-for="(edu, i) in editForm.educations" :key="i"
                    class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-400 text-sm">Formação #{{ i + 1 }}</span>
                        <button @click="editForm.educations.splice(i, 1)"
                            class="text-red-400 hover:text-red-300 text-sm">
                            Remover
                        </button>
                    </div>
                    <input v-model="edu.degree" placeholder="Grau" class="input" />
                    <input v-model="edu.institution" placeholder="Instituição" class="input" />
                    <div class="grid grid-cols-2 gap-2">
                        <input v-model="edu.startDate" type="month" class="input" />
                        <input v-model="edu.endDate" type="month" class="input" />
                    </div>
                </div>
            </section>

            <!-- Projects -->
            <section class="border-t border-slate-800 pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">💻 Projetos</h3>
                    <button @click="addProject" class="text-blue-500 hover:text-blue-400 text-sm">+ Adicionar</button>
                </div>

                <div v-for="(proj, i) in editForm.projects" :key="i"
                    class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-400 text-sm">Projeto #{{ i + 1 }}</span>
                        <button @click="editForm.projects.splice(i, 1)"
                            class="text-red-400 hover:text-red-300 text-sm">Remover</button>
                    </div>
                    <input v-model="proj.name" placeholder="Nome do projeto" class="input" />
                    <input v-model="proj.role" placeholder="Função" class="input" />
                    <input v-model="proj.url" placeholder="URL" class="input" />
                    <textarea v-model="proj.description" placeholder="Descrição" rows="3" class="input"></textarea>
                    <input v-model="proj.technologies" placeholder="Tecnologias (vírgula separadas)" class="input" />
                    <input v-model="proj.highlights" placeholder="Destaques (vírgula separadas)" class="input" />
                </div>
            </section>


            <!-- Certifications -->
            <section class="border-t border-slate-800 pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">📜 Certificações</h3>
                    <button @click="addCertification" class="text-blue-500 hover:text-blue-400 text-sm">+
                        Adicionar</button>
                </div>

                <div v-for="(cert, i) in editForm.certifications" :key="i"
                    class="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-slate-400 text-sm">Certificação #{{ i + 1 }}</span>
                        <button @click="editForm.certifications.splice(i, 1)"
                            class="text-red-400 hover:text-red-300 text-sm">Remover</button>
                    </div>
                    <input v-model="cert.name" placeholder="Nome da certificação" class="input" />
                    <input v-model="cert.issuingOrg" placeholder="Org. Emissora" class="input" />
                    <input v-model="cert.issueDate" type="month" placeholder="Data de emissão" class="input" />
                    <input v-model="cert.expirationDate" type="month" placeholder="Data de expiração" class="input"
                        :disabled="cert.doesNotExpire" />
                    <input type="checkbox" v-model="cert.doesNotExpire" /> Não expira
                    <input v-model="cert.credentialId" placeholder="ID da credencial" class="input" />
                    <input v-model="cert.credentialUrl" placeholder="URL da credencial" class="input" />
                </div>
            </section>

            <!-- 🧠 Skills -->
            <section class="border-t border-slate-800 pt-6">
                <h3 class="text-lg font-bold mb-4">🧠 Competências</h3>
                <div class="flex flex-wrap gap-2 mb-3">
                    <span v-for="(skill, i) in editForm.skills" :key="i"
                        class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center gap-2">
                        {{ skill.name || skill }}
                        <button @click="editForm.skills.splice(i, 1)" class="hover:text-red-400">×</button>
                    </span>
                </div>
                <div class="flex gap-2">
                    <input v-model="newSkill" @keyup.enter="addSkill" placeholder="Adicionar skill..."
                        class="input flex-1" />
                    <button @click="addSkill" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
                        Adicionar
                    </button>
                </div>
            </section>


            <!-- Languages -->
            <section class="border-t border-slate-800 pt-6">
                <h3 class="text-lg font-bold mb-4">🌐 Idiomas</h3>
                <div class="flex flex-wrap gap-2 mb-3">
                    <span v-for="(lang, i) in editForm.languages" :key="i"
                        class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center gap-2">
                        {{ lang }}
                        <button @click="editForm.languages.splice(i, 1)" class="hover:text-red-400">×</button>
                    </span>
                </div>
                <input v-model="newLanguage" @keyup.enter="addLanguage" placeholder="Adicionar idioma..."
                    class="input flex-1" />
                <button @click="addLanguage"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">Adicionar</button>
            </section>

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
                template: '',
                personalInfo: { name: '', email: '', phone: '', location: '' },
                summary: '',
                experiences: [],
                educations: [],
                projects: [],
                certifications: [],
                languages: [],
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
        await this.cvStore.fetchCVs();
    },


    methods: {
        startEditCV(cv) {
            this.editingCV = cv
            const content = cv.contentJson || {};


            // Preenche o formulário com valores existentes ou defaults
            this.editForm = {
                id: cv.id,
                title: cv.title || '',
                targetRole: cv.targetRole || '',
                template: cv.templateId || 'template_classic',
                summary: content.summary || '',
                personalInfo: {
                    name: content.personalInfo?.name || '',
                    email: content.personalInfo?.email || '',
                    phone: content.personalInfo?.phone || '',
                    location: content.personalInfo?.location || '',
                    github: content.personalInfo?.github || '',
                    linkedin: content.personalInfo?.linkedin || '',
                },
                experiences: content.experiences
                    ? JSON.parse(JSON.stringify(content.experiences))
                    : [],

                educations: content.educations
                    ? JSON.parse(JSON.stringify(content.educations))
                    : [],

                projects: content.projects
                    ? JSON.parse(JSON.stringify(content.projects))
                    : [],

                certifications: content.certifications
                    ? JSON.parse(JSON.stringify(content.certifications))
                    : [],

                skills: content.skills
                    ? JSON.parse(JSON.stringify(content.skills))
                    : [],
                languages: content.languages
                    ? JSON.parse(JSON.stringify(content.languages))
                    : [],
            }

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

        addProject() {
            this.editForm.projects.push({
                name: '',
                role: '',
                url: '',
                description: '',
                technologies: [],
                highlights: []
            })
        },

        removeProject(index) {
            this.editForm.projects.splice(index, 1)
        },

        addCertification() {
            this.editForm.certifications.push({
                name: '',
                issuingOrg: '',
                issueDate: '',
                expirationDate: '',
                credentialId: '',
                credentialUrl: '',
                doesNotExpire: false,
            })
        },

        removeCertification(index) {
            this.editForm.certifications.splice(index, 1)
        },

        // Salvar edição - CORRIGIDO
        async saveEditCV() {
            if (!this.editingCV) return

            // Envia APENAS os dados do editForm
            const payload = {
                title: this.editForm.title,
                targetRole: this.editForm.targetRole,
                templateId: this.editForm.template || 'template_classic', // ✅ fallback
                language: 'PT',
                contentJson: {
                    personalInfo: this.editForm.personalInfo,
                    summary: this.editForm.summary,
                    experiences: this.editForm.experiences,
                    educations: this.editForm.educations,
                    projects: this.editForm.projects,
                    certifications: this.editForm.certifications,
                    skills: this.editForm.skills,
                    languages: this.editForm.languages,
                },
            }


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
