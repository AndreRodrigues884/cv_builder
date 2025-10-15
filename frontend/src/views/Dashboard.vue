<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <Sidebar :activeSection="activeSection" @change-section="activeSection = $event" />
    
    <!-- Main Content -->
    <main class="ml-64 min-h-screen">
      <!-- Top Bar -->
      <Header :activeSection="activeSection" />
      <router-view />

      <!-- Dashboard Content -->
      <div class="p-8">
        <!-- Dashboard Overview -->
        <div v-if="activeSection === 'dashboard'">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">CVs Criados</span>
                <span class="text-2xl">📄</span>
              </div>
              <div class="text-3xl font-bold text-blue-500">{{ stats.cvsCreated }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ stats.cvsLimit }} disponíveis este mês</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Score ATS Médio</span>
                <span class="text-2xl">✅</span>
              </div>
              <div class="text-3xl font-bold text-green-500">{{ stats.atsScore }}%</div>
              <div class="text-xs text-green-400 mt-1">+5% vs última análise</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Candidaturas</span>
                <span class="text-2xl">🎯</span>
              </div>
              <div class="text-3xl font-bold text-purple-500">{{ stats.applications }}</div>
              <div class="text-xs text-slate-500 mt-1">Este mês</div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-orange-500/30 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-sm">Entrevistas</span>
                <span class="text-2xl">💼</span>
              </div>
              <div class="text-3xl font-bold text-orange-500">{{ stats.interviews }}</div>
              <div class="text-xs text-orange-400 mt-1">Taxa de 15%</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button @click="activeSection = 'create-cv'"
                class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-left hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">✨</div>
                <h3 class="text-lg font-bold mb-2">Criar Novo CV</h3>
                <p class="text-sm text-blue-100">Cria um CV profissional em minutos com IA</p>
              </button>

              <button @click="activeSection = 'ai-review'"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-blue-500/30 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">🎯</div>
                <h3 class="text-lg font-bold mb-2">AI Review</h3>
                <p class="text-sm text-slate-400">Analisa e melhora o teu CV</p>
              </button>

              <button @click="activeSection = 'templates'"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left hover:border-purple-500/30 hover:-translate-y-1 transition-all">
                <div class="text-3xl mb-3">🎨</div>
                <h3 class="text-lg font-bold mb-2">Ver Templates</h3>
                <p class="text-sm text-slate-400">Explora designs profissionais</p>
              </button>
            </div>
          </div>

          <!-- Recent CVs -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">CVs Recentes</h2>
              <button @click="activeSection = 'my-cvs'"
                class="text-blue-500 hover:text-blue-400 text-sm font-medium">Ver todos →</button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div v-for="cv in recentCVs" :key="cv.id"
                class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-bold mb-1">{{ cv.title }}</h3>
                    <p class="text-sm text-slate-400">{{ cv.targetRole }}</p>
                  </div>
                  <span :class="cv.statusColor" class="px-3 py-1 rounded-full text-xs font-semibold">
                    {{ cv.status }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>Template: {{ cv.template }}</span>
                  <span>•</span>
                  <span>{{ cv.updatedAt }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium">
                    Editar
                  </button>
                  <button
                    class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all text-sm font-medium">
                    Download
                  </button>
                  <button
                    class="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create CV Section -->
        <div v-if="activeSection === 'create-cv'" class="max-w-4xl mx-auto">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="text-center mb-8">
              <div
                class="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                ✨
              </div>
              <h2 class="text-3xl font-bold mb-2">Criar Novo CV</h2>
              <p class="text-slate-400">Responde algumas perguntas e deixa a IA fazer o resto</p>
            </div>

            <!-- Progress Steps -->
            <div class="flex justify-between mb-12">
              <div v-for="(step, index) in createSteps" :key="index" class="flex flex-col items-center flex-1">
                <div :class="currentStep >= index ? 'bg-blue-600' : 'bg-slate-800'"
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all">
                  {{ index + 1 }}
                </div>
                <span class="text-xs text-center" :class="currentStep >= index ? 'text-blue-500' : 'text-slate-500'">{{
                  step }}</span>
                <div v-if="index < createSteps.length - 1" class="h-0.5 w-full mt-5 -translate-y-10 ml-10"
                  :class="currentStep > index ? 'bg-blue-600' : 'bg-slate-800'"></div>
              </div>
            </div>

            <!-- Form Steps -->
            <div class="space-y-6">
              <div v-if="currentStep === 0">
                <label class="block text-sm font-medium mb-2">Nome Completo</label>
                <input type="text" v-model="cvForm.name"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="João Silva">

                <label class="block text-sm font-medium mb-2 mt-4">Email</label>
                <input type="email" v-model="cvForm.email"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="joao@example.com">

                <label class="block text-sm font-medium mb-2 mt-4">Telefone</label>
                <input type="tel" v-model="cvForm.phone"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="+351 912 345 678">

                <label class="block text-sm font-medium mb-2 mt-4">Localização</label>
                <input type="text" v-model="cvForm.location"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Porto, Portugal">
              </div>

              <div v-if="currentStep === 1">
                <label class="block text-sm font-medium mb-2">Cargo Desejado</label>
                <input type="text" v-model="cvForm.targetRole"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Full Stack Developer">

                <label class="block text-sm font-medium mb-2 mt-4">Área Profissional</label>
                <select v-model="cvForm.area"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
                  <option value="">Seleciona uma área</option>
                  <option value="tech">Tecnologia</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Vendas</option>
                  <option value="management">Gestão</option>
                </select>

                <label class="block text-sm font-medium mb-2 mt-4">Sumário Profissional</label>
                <textarea v-model="cvForm.summary" rows="4"
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Breve descrição sobre ti e tua experiência..."></textarea>
                <button class="text-blue-500 text-sm mt-2 hover:text-blue-400">✨ Gerar com IA</button>
              </div>

              <div v-if="currentStep === 2">
                <div class="flex justify-between items-center mb-4">
                  <label class="block text-sm font-medium">Experiência Profissional</label>
                  <button class="text-blue-500 text-sm hover:text-blue-400">+ Adicionar</button>
                </div>
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
                  <input type="text" placeholder="Cargo"
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mb-3 focus:border-blue-500 focus:outline-none">
                  <input type="text" placeholder="Empresa"
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mb-3 focus:border-blue-500 focus:outline-none">
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <input type="month" placeholder="Data Início"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                    <input type="month" placeholder="Data Fim"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                  </div>
                  <textarea rows="3" placeholder="Descrição e conquistas..."
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"></textarea>
                  <button class="text-blue-500 text-sm mt-2 hover:text-blue-400">✨ Melhorar com IA</button>
                </div>

                <div class="flex justify-between items-center mb-4 mt-6">
                  <label class="block text-sm font-medium">Formação Académica</label>
                  <button class="text-blue-500 text-sm hover:text-blue-400">+ Adicionar</button>
                </div>
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <input type="text" placeholder="Grau"
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mb-3 focus:border-blue-500 focus:outline-none">
                  <input type="text" placeholder="Instituição"
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mb-3 focus:border-blue-500 focus:outline-none">
                  <div class="grid grid-cols-2 gap-3">
                    <input type="month" placeholder="Data Início"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                    <input type="month" placeholder="Data Fim"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                  </div>
                </div>
              </div>

              <div v-if="currentStep === 3">
                <label class="block text-sm font-medium mb-4">Competências</label>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="skill in cvForm.skills" :key="skill"
                    class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm flex items-center gap-2">
                    {{ skill }}
                    <button class="hover:text-red-400">×</button>
                  </span>
                </div>
                <div class="flex gap-2 mb-4">
                  <input type="text" v-model="newSkill" @keyup.enter="addSkill" placeholder="Adicionar competência..."
                    class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                  <button @click="addSkill"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">Adicionar</button>
                </div>
                <button class="text-purple-500 text-sm hover:text-purple-400">✨ IA sugerir competências</button>

                <label class="block text-sm font-medium mb-2 mt-6">Idiomas</label>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <select
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 mb-2 focus:border-blue-500 focus:outline-none">
                      <option>Português</option>
                      <option>Inglês</option>
                      <option>Espanhol</option>
                      <option>Francês</option>
                    </select>
                    <select
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none">
                      <option>Nativo</option>
                      <option>Fluente</option>
                      <option>Avançado</option>
                      <option>Intermédio</option>
                      <option>Básico</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8 pt-6 border-t border-slate-800">
              <button v-if="currentStep > 0" @click="currentStep--"
                class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all font-medium">
                ← Anterior
              </button>
              <div v-else></div>
              <button v-if="currentStep < createSteps.length - 1" @click="currentStep++"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-medium">
                Próximo →
              </button>
              <button v-else @click="activeSection = 'templates'"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">
                Escolher Template →
              </button>
            </div>
          </div>
        </div>

        <!-- My CVs Section -->
        <div v-if="activeSection === 'my-cvs'">
          <div class="flex justify-between items-center mb-6">
            <div class="flex gap-4">
              <button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Todos ({{ allCVs.length
              }})</button>
              <button
                class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-all">Publicados</button>
              <button
                class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-all">Rascunhos</button>
            </div>
            <button @click="activeSection = 'create-cv'"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium">
              + Novo CV
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cv in allCVs" :key="cv.id"
              class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all group">
              <div
                class="h-48 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center relative overflow-hidden">
                <div class="text-center">
                  <div class="text-4xl mb-2">{{ cv.icon }}</div>
                  <div class="text-sm text-slate-400">{{ cv.template }}</div>
                </div>
                <div class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all"></div>
              </div>
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="font-bold mb-1">{{ cv.title }}</h3>
                    <p class="text-sm text-slate-400">{{ cv.targetRole }}</p>
                  </div>
                  <span :class="cv.statusColor" class="px-2 py-1 rounded text-xs font-semibold">
                    {{ cv.status }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 mb-4">
                  Atualizado há {{ cv.updatedAt }}
                </div>
                <div class="flex gap-2">
                  <button
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium">
                    Editar
                  </button>
                  <button
                    class="px-3 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    ⬇
                  </button>
                  <button
                    class="px-3 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Review Section -->
        <div v-if="activeSection === 'ai-review'" class="max-w-5xl mx-auto">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
            <h2 class="text-2xl font-bold mb-4">Analisar CV com IA</h2>
            <p class="text-slate-400 mb-6">Seleciona um CV para análise detalhada com pontuação ATS, linguagem, impacto
              e clareza</p>

            <select
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:border-blue-500 focus:outline-none transition-all">
              <option value="">Seleciona um CV</option>
              <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
            </select>

            <button
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold flex items-center justify-center gap-2">
              <span class="text-xl">🎯</span>
              Analisar com IA
            </button>
          </div>

          <!-- Review Results (Mock) -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 class="text-xl font-bold mb-6">Resultado da Análise</h3>

            <!-- Overall Score -->
            <div
              class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <div class="text-center mb-4">
                <div
                  class="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                  85</div>
                <div class="text-slate-400">Score Geral</div>
              </div>
            </div>

            <!-- Detailed Scores -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-slate-800 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-green-500 mb-1">92</div>
                <div class="text-xs text-slate-400">ATS</div>
              </div>
              <div class="bg-slate-800 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-blue-500 mb-1">78</div>
                <div class="text-xs text-slate-400">Linguagem</div>
              </div>
              <div class="bg-slate-800 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-purple-500 mb-1">88</div>
                <div class="text-xs text-slate-400">Impacto</div>
              </div>
              <div class="bg-slate-800 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-cyan-500 mb-1">82</div>
                <div class="text-xs text-slate-400">Clareza</div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="space-y-4">
              <div class="bg-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <span class="text-xl">⚠️</span>
                  <div class="flex-1">
                    <div class="font-semibold mb-1">Adiciona números e resultados</div>
                    <p class="text-sm text-slate-400">As tuas experiências ganhariam mais impacto com métricas
                      quantificáveis</p>
                  </div>
                  <span class="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Alta</span>
                </div>
              </div>

              <div class="bg-slate-800 border border-blue-500/30 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <span class="text-xl">💡</span>
                  <div class="flex-1">
                    <div class="font-semibold mb-1">Usa verbos de ação</div>
                    <p class="text-sm text-slate-400">Substitui frases passivas por verbos impactantes: Desenvolvi,
                      Implementei, Liderei</p>
                  </div>
                  <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Média</span>
                </div>
              </div>

              <div class="bg-slate-800 border border-green-500/30 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <span class="text-xl">✅</span>
                  <div class="flex-1">
                    <div class="font-semibold mb-1">Ponto forte</div>
                    <p class="text-sm text-slate-400">Excelente estrutura e organização das competências técnicas</p>
                  </div>
                  <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Info</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Match Section -->
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
            <select
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:border-blue-500 focus:outline-none transition-all">
              <option value="">Seleciona um CV</option>
              <option v-for="cv in allCVs" :key="cv.id" :value="cv.id">{{ cv.title }}</option>
            </select>

            <label class="block text-sm font-medium mb-2">Descrição da Vaga</label>
            <p class="text-xs text-slate-500 mb-2">Cola a descrição completa da vaga ou insere o link do LinkedIn</p>
            <textarea rows="8"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-4 focus:border-blue-500 focus:outline-none transition-all"
              placeholder="Cole aqui a descrição da vaga ou link do LinkedIn..."></textarea>

            <div class="flex gap-3">
              <button
                class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold">
                Adaptar CV para Esta Vaga
              </button>
              <button
                class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                Importar do LinkedIn
              </button>
            </div>
          </div>
        </div>

        <!-- Career Copilot Section -->
        <div v-if="activeSection === 'career-copilot'" class="max-w-4xl mx-auto">
          <div
            class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold mb-2">🚀 Career Copilot</h2>
                <p class="text-slate-400">Teu assistente pessoal de carreira com IA</p>
              </div>
              <span
                class="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-semibold">Premium</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all cursor-pointer">
              <div class="text-3xl mb-4">💬</div>
              <h3 class="text-lg font-bold mb-2">Simulação de Entrevista</h3>
              <p class="text-sm text-slate-400 mb-4">Prepara-te com perguntas geradas pela IA baseadas no teu CV</p>
              <button class="text-purple-500 text-sm font-medium hover:text-purple-400">Começar →</button>
            </div>

            <div
              class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all cursor-pointer">
              <div class="text-3xl mb-4">📈</div>
              <h3 class="text-lg font-bold mb-2">Análise de Carreira</h3>
              <p class="text-sm text-slate-400 mb-4">Descobre os melhores caminhos para a tua progressão profissional
              </p>
              <button class="text-blue-500 text-sm font-medium hover:text-blue-400">Analisar →</button>
            </div>

            <div
              class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer">
              <div class="text-3xl mb-4">🎯</div>
              <h3 class="text-lg font-bold mb-2">Lacunas de Competências</h3>
              <p class="text-sm text-slate-400 mb-4">Identifica skills que faltam para atingir os teus objetivos</p>
              <button class="text-cyan-500 text-sm font-medium hover:text-cyan-400">Descobrir →</button>
            </div>

            <div
              class="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500/30 transition-all cursor-pointer">
              <div class="text-3xl mb-4">📚</div>
              <h3 class="text-lg font-bold mb-2">Recomendação de Cursos</h3>
              <p class="text-sm text-slate-400 mb-4">Cursos e formações personalizadas para o teu crescimento</p>
              <button class="text-green-500 text-sm font-medium hover:text-green-400">Ver Cursos →</button>
            </div>
          </div>
        </div>

        <!-- Templates Section -->
        <div v-if="activeSection === 'templates'">
          <div class="flex gap-4 mb-6">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Todos</button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all">Moderno</button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all">Clássico</button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all">Criativo</button>
            <button class="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all">Executivo</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="template in templates" :key="template.id"
              class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all group cursor-pointer">
              <div
                class="h-64 bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center justify-center relative">
                <div class="w-full h-full bg-slate-800/50 rounded-lg"></div>
                <div
                  class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all">
                    Usar Template
                  </button>
                </div>
                <span v-if="template.isPremium"
                  class="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-xs font-semibold">
                  Premium
                </span>
              </div>
              <div class="p-4">
                <h3 class="font-bold mb-1">{{ template.name }}</h3>
                <p class="text-sm text-slate-400">{{ template.type }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Section -->
        <div v-if="activeSection === 'settings'" class="max-w-4xl mx-auto">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 class="text-2xl font-bold mb-6">Definições</h2>

            <div class="space-y-6">
              <div>
                <h3 class="font-semibold mb-4">Conta</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <div class="font-medium">Email</div>
                      <div class="text-sm text-slate-400">user@example.com</div>
                    </div>
                    <button class="text-blue-500 text-sm hover:text-blue-400">Alterar</button>
                  </div>
                  <div class="flex items-center justify-between py-3 border-b border-slate-800">
                    <div>
                      <div class="font-medium">Password</div>
                      <div class="text-sm text-slate-400">••••••••</div>
                    </div>
                    <button class="text-blue-500 text-sm hover:text-blue-400">Alterar</button>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-4">Plano</h3>
                <div
                  class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-lg font-bold">{{ userPlan }}</div>
                      <div class="text-sm text-slate-400">{{ stats.cvsCreated }}/{{ stats.cvsLimit }} CVs este mês</div>
                    </div>
                    <router-link to="/upgrade"
                      class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold">
                      Upgrade
                    </router-link>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-4">Preferências</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-3">
                    <div>
                      <div class="font-medium">Notificações por Email</div>
                      <div class="text-sm text-slate-400">Receber atualizações e dicas</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked class="sr-only peer">
                      <div
                        class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "../components/dashboard/sidebar.vue"
import Header from "../components/dashboard/header.vue"
import { ref } from "vue";


// Estado reativo
const activeSection = ref("dashboard");
const userPlan = ref("PRO");
const currentStep = ref(0);
const newSkill = ref("");

const cvForm = ref({
  name: "",
  email: "",
  phone: "",
  location: "",
  targetRole: "",
  area: "",
  summary: "",
  skills: ["JavaScript", "React", "Node.js", "TypeScript"]
});

const stats = ref({
  cvsCreated: 2,
  cvsLimit: 1,
  atsScore: 85,
  applications: 12,
  interviews: 3
});

const createSteps = ref(["Info Pessoal", "Objetivo", "Experiência", "Competências"]);

const recentCVs = ref([
  {
    id: 1,
    title: "CV - Full Stack Developer",
    targetRole: "Senior Developer",
    template: "Moderno",
    status: "Publicado",
    statusColor: "bg-green-500/20 text-green-400",
    updatedAt: "2 dias"
  },
  {
    id: 2,
    title: "CV - Frontend Specialist",
    targetRole: "React Developer",
    template: "Criativo",
    status: "Rascunho",
    statusColor: "bg-yellow-500/20 text-yellow-400",
    updatedAt: "1 semana"
  }
]);

const allCVs = ref([
  {
    id: 1,
    title: "CV - Full Stack Developer",
    targetRole: "Senior Developer",
    template: "Moderno",
    icon: "📄",
    status: "Publicado",
    statusColor: "bg-green-500/20 text-green-400",
    updatedAt: "2 dias"
  },
  {
    id: 2,
    title: "CV - Frontend Specialist",
    targetRole: "React Developer",
    template: "Criativo",
    icon: "🎨",
    status: "Rascunho",
    statusColor: "bg-yellow-500/20 text-yellow-400",
    updatedAt: "1 semana"
  },
  {
    id: 3,
    title: "CV - Backend Engineer",
    targetRole: "Node.js Developer",
    template: "Clássico",
    icon: "⚙️",
    status: "Arquivado",
    statusColor: "bg-slate-500/20 text-slate-400",
    updatedAt: "1 mês"
  }
]);

const templates = ref([
  { id: 1, name: "Profissional Moderno", type: "Moderno", isPremium: false },
  { id: 2, name: "Clássico Executivo", type: "Clássico", isPremium: false },
  { id: 3, name: "Criativo Designer", type: "Criativo", isPremium: true },
  { id: 4, name: "Minimalista Clean", type: "Minimalista", isPremium: false },
  { id: 5, name: "Tech Specialist", type: "Técnico", isPremium: true },
  { id: 6, name: "Bold & Modern", type: "Moderno", isPremium: true }
]);

// Métodos

const addSkill = () => {
  if (newSkill.value.trim()) {
    cvForm.value.skills.push(newSkill.value.trim());
    newSkill.value = "";
  }
};
</script>


<style scoped>
html {
  scroll-behavior: smooth;
}
</style>