<template>
    <div v-if="activeSection === 'job-match'" class="max-w-4xl mx-auto">
        <div
            class="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold mb-2">AI Job Match</h2>
                    <p class="text-slate-400">Adapta o teu CV automaticamente para uma vaga específica</p>
                </div>
                <span class="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">Pro</span>
            </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <label class="block text-sm font-medium mb-2">Seleciona o CV</label>
            <select v-model="selectedCVId"
                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:border-blue-500 focus:outline-none transition-all">
                <option value="">Seleciona um CV</option>
                <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
            </select>

            <label class="block text-sm font-medium mb-2">Descrição da Vaga</label>
            <p class="text-xs text-slate-500 mb-2">Cola a descrição completa da vaga ou insere o link do LinkedIn</p>
            <textarea v-model="jobDescription" rows="8"
                class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-4 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Cole aqui a descrição da vaga ou link do LinkedIn..."></textarea>

            <div class="flex gap-3">
                <button @click="adaptCV" :disabled="loading"
                    class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold">
                    {{ loading ? 'Adaptando...' : 'Adaptar CV para Esta Vaga' }}
                </button>
                <button @click="importLinkedIn"
                    class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    Importar do LinkedIn
                </button>
            </div>

            <!-- Resultado (Mock) -->
            <div v-if="adaptedCV" class="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 class="font-bold mb-2">CV Adaptado</h3>
                <p class="text-sm text-slate-400">{{ adaptedCV }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { useCVStore } from '../../stores/cv'

export default {
    name: 'JobMatch',

    data() {
        return {
            activeSection: 'job-match',
            selectedCVId: '',
            jobDescription: '',
            adaptedCV: null,
            loading: false,
            error: null
        }
    },

    created() {
        this.cvStore = useCVStore() // ← inicializa aqui
    },

    computed: {
        allCVs() {
            return this.cvStore.cvs
        },
    },

    async mounted() {
        // Carrega CVs se ainda não foram carregados
        if (!this.cvStore.cvs.length) {
            await this.cvStore.fetchCVs()
        }
    },

    methods: {
        async adaptCV() {
            if (!this.selectedCVId || !this.jobDescription) {
                alert('Escolhe um CV e insere a descrição da vaga!')
                return
            }

            this.loading = true
            this.adaptedCV = null
            this.error = null

            try {
                // Simulação de delay/API call
                await new Promise(r => setTimeout(r, 1000))

                // Mock result (substituir com endpoint real de IA)
                const selectedCV = this.cvStore.cvs.find(cv => cv.id === this.selectedCVId)
                this.adaptedCV = `CV "${selectedCV.title}" adaptado para a vaga: "${this.jobDescription.slice(0, 50)}..."`

            } catch (err) {
                console.error('Erro ao adaptar CV:', err)
                this.error = 'Erro ao adaptar CV'
            } finally {
                this.loading = false
            }
        }, 

        importLinkedIn() {
            alert('Funcionalidade de importação do LinkedIn ainda não implementada.')
        }
    }
}
</script>
