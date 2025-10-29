<template>
    <div v-if="activeSection === 'create-cv'" class="max-w-5xl mx-auto">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="text-center mb-8">
                <div
                    class="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    🧠
                </div>
                <h2 class="text-3xl font-bold mb-2">Criar Novo CV</h2>
                <p class="text-slate-400">Preenche os teus dados ou deixa a IA gerar partes automaticamente</p>
            </div>

            <!-- Barra de etapas -->
            <div class="flex justify-between mb-10">
                <div v-for="(step, index) in createSteps" :key="index" class="flex flex-col items-center flex-1">
                    <div :class="currentStep >= index ? 'bg-blue-600' : 'bg-slate-800'"
                        class="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all">
                        {{ index + 1 }}
                    </div>
                    <span class="text-xs" :class="currentStep >= index ? 'text-blue-400' : 'text-slate-500'">{{ step
                    }}</span>
                </div>
            </div>

            <!-- STEP 1: Informações Pessoais -->
            <div v-if="currentStep === 0" class="space-y-4">
                <input v-model="cvForm.title" placeholder="Título do CV"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 ..." />
                <input v-model="cvForm.name" placeholder="Nome Completo"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all" />
                <input v-model="cvForm.email" placeholder="Email"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all" />
                <input v-model="cvForm.phone" placeholder="Telefone"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all" />
                <input v-model="cvForm.location" placeholder="Localização"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all" />
                <input v-model="cvForm.targetRole" placeholder="Cargo Desejado"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all" />
                <textarea v-model="cvForm.summary" rows="4" placeholder="Resumo profissional"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"></textarea>
                <label>Escolher Template</label>
                <select v-model="selectedTemplateId" class="w-full ...">
                    <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">{{ tpl.name }}</option>
                </select>
            </div>

            <!-- STEP 2: Experiência -->
            <div v-if="currentStep === 1" class="space-y-6">
                <h3 class="text-lg font-semibold mb-4">Experiência Profissional</h3>

                <div v-for="(exp, index) in cvForm.experiences" :key="index"
                    class="p-4 border border-slate-800 rounded-xl bg-slate-800/50">
                    <input v-model="exp.role" placeholder="Cargo"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="exp.company" placeholder="Empresa"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="exp.location" placeholder="Localização"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <div class="flex gap-2">
                        <input v-model="exp.startDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all flex-1" />
                        <input v-model="exp.endDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all flex-1" />
                    </div>
                    <textarea v-model="exp.description" rows="3" placeholder="Descrição das funções"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mt-2"></textarea>
                    <button @click="removeExperience(index)"
                        class="text-red-400 border border-red-700/40 rounded-lg px-4 py-2 hover:bg-red-500/20 transition-all; mt-3">🗑️
                        Remover</button>
                </div>

                <button @click="addExperience"
                    class="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all font-medium w-full mt-4">+
                    Adicionar Experiência</button>
            </div>

            <!-- STEP 3: Educação -->
            <div v-if="currentStep === 2" class="space-y-6">
                <h3 class="text-lg font-semibold mb-4">Educação</h3>

                <div v-for="(edu, index) in cvForm.educations" :key="index"
                    class="p-4 border border-slate-800 rounded-xl bg-slate-800/50">
                    <input v-model="edu.degree" placeholder="Grau (ex: Licenciatura)"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="edu.institution" placeholder="Instituição"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="edu.fieldOfStudy" placeholder="Área de Estudo"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <div class="flex gap-2">
                        <input v-model="edu.startDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all flex-1" />
                        <input v-model="edu.endDate" type="date"
                            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all flex-1" />
                    </div>
                    <textarea v-model="edu.description" rows="2" placeholder="Descrição ou conquistas"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mt-2"></textarea>
                    <button @click="removeEducation(index)"
                        class="text-red-400 border border-red-700/40 rounded-lg px-4 py-2 hover:bg-red-500/20 transition-all; mt-3">🗑️
                        Remover</button>
                </div>

                <button @click="addEducation"
                    class="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all font-medium w-full mt-4">+
                    Adicionar Educação</button>
            </div>

            <!-- STEP 4: Projetos -->
            <div v-if="currentStep === 3" class="space-y-6">
                <h3 class="text-lg font-semibold mb-4">Projetos</h3>

                <div v-for="(proj, index) in cvForm.projects" :key="index"
                    class="p-4 border border-slate-800 rounded-xl bg-slate-800/50">
                    <input v-model="proj.name" placeholder="Nome do Projeto"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="proj.role" placeholder="Função no projeto"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <input v-model="proj.url" placeholder="URL (opcional)"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all mb-2" />
                    <textarea v-model="proj.description" rows="3" placeholder="Descrição"
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"></textarea>
                    <button @click="removeProject(index)"
                        class="text-red-400 border border-red-700/40 rounded-lg px-4 py-2 hover:bg-red-500/20 transition-all; mt-3">🗑️
                        Remover</button>
                </div>

                <button @click="addProject"
                    class="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all font-medium w-full mt-4">+
                    Adicionar Projeto</button>
            </div>

            <!-- STEP 5: Competências -->
            <div v-if="currentStep === 4" class="space-y-6">
                <h3 class="text-lg font-semibold mb-4">Competências</h3>

                <div class="flex flex-wrap gap-2 mb-4">
                    <span v-for="skill in cvForm.skills" :key="skill"
                        class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center gap-2">
                        {{ skill }}
                        <button @click="removeSkill(skill)" class="hover:text-red-400">×</button>
                    </span>
                </div>

                <div class="flex gap-2">
                    <input v-model="newSkill" @keyup.enter="addSkill" type="text" placeholder="Adicionar competência..."
                        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all flex-1" />
                    <button @click="addSkill"
                        class="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all font-medium">Adicionar</button>
                </div>
            </div>

            <!-- Botões de navegação -->
            <div class="flex justify-between mt-10 pt-6 border-t border-slate-800">
                <button v-if="currentStep > 0" @click="currentStep--"
                    class="border border-slate-700 text-slate-300 rounded-lg px-5 py-2 hover:bg-slate-800 transition-all font-medium">←
                    Anterior</button>
                <div v-else></div>

                <button v-if="currentStep < createSteps.length - 1" @click="nextStep"
                    class="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all font-medium">Próximo
                    →</button>

                <button v-else @click="submitCV"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-3 hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">Criar
                    CV →</button>
            </div>
        </div>
    </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'

export default {
    name: 'CreateCV',

    data() {
        return {
            activeSection: 'create-cv',
            currentStep: 0,
            createSteps: [
                'Informações Pessoais',
                'Experiência',
                'Educação',
                'Projetos',
                'Competências'
            ],
            newSkill: '',
            cvForm: {
                name: '',
                email: '',
                phone: '',
                location: '',
                targetRole: '',
                summary: '',
                experiences: [],
                educations: [],
                projects: [],
                skills: []
            },
        }
    },

    computed: {
        cvStore() {
            return useCVStore()
        }
    },

    methods: {
        nextStep() {
            if (this.currentStep < this.createSteps.length - 1) this.currentStep++
        },

        // Experiências
        addExperience() {
            this.cvForm.experiences.push({
                role: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                description: ''
            })
        },
        removeExperience(index) {
            this.cvForm.experiences.splice(index, 1)
        },

        // Educação
        addEducation() {
            this.cvForm.educations.push({
                degree: '',
                institution: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                description: ''
            })
        },
        removeEducation(index) {
            this.cvForm.educations.splice(index, 1)
        },

        // Projetos
        addProject() {
            this.cvForm.projects.push({
                name: '',
                role: '',
                url: '',
                description: ''
            })
        },
        removeProject(index) {
            this.cvForm.projects.splice(index, 1)
        },

        // Competências
        addSkill() {
            if (this.newSkill && !this.cvForm.skills.includes(this.newSkill)) {
                this.cvForm.skills.push(this.newSkill)
                this.newSkill = ''
            }
        },
        removeSkill(skill) {
            this.cvForm.skills = this.cvForm.skills.filter(s => s !== skill)
        },

        // Submeter
        async submitCV() {
            try {
                const payload = {
                    title: this.cvForm.name || 'Novo CV',
                    targetRole: this.cvForm.targetRole,
                    templateId: this.selectedTemplateId || 'default-template-id',
                    language: 'PT',
                    jobTargetTitle: this.cvForm.targetRole,
                    jobTargetArea: this.cvForm.area || 'Geral',
                    contentJson: {
                        personalInfo: {
                            name: this.cvForm.name,
                            email: this.cvForm.email,
                            phone: this.cvForm.phone,
                            location: this.cvForm.location,
                            summary: this.cvForm.summary,
                        },
                        experiences: this.cvForm.experiences,
                        educations: this.cvForm.educations,
                        projects: this.cvForm.projects,
                        skills: this.cvForm.skills,
                    },
                    generatePdf: true
                }

                console.log('📤 Enviando CV formatado para API:', payload)

                const result = await this.cvStore.createCV(payload)

                if (result.success) {
                    alert('✅ CV criado com sucesso!')
                    await this.cvStore.fetchCVs()
                    this.activeSection = 'my-cvs'
                } else {
                    alert('❌ Erro ao criar CV: ' + result.message)
                }

            } catch (err) {
                console.error('Erro ao criar CV:', err)
                alert('❌ Erro inesperado ao criar CV')
            }
        }
    }
}
</script>
