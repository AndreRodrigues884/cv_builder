<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Sidebar (mesmo da Dashboard) -->
    <aside class="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-40">
      <div class="p-6">
        <router-link to="/dashboard" class="flex items-center gap-2 mb-8">
          <span class="text-3xl">📄</span>
          <span class="text-xl font-bold">
            CV<span class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Builder</span>
          </span>
        </router-link>

        <nav class="space-y-2">
          <router-link to="/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-all">
            <span class="text-xl">📊</span>
            <span class="font-medium">Dashboard</span>
          </router-link>

          <router-link to="/profile"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white transition-all">
            <span class="text-xl">👤</span>
            <span class="font-medium">Perfil</span>
          </router-link>

          <div class="border-t border-slate-800 my-4"></div>

          <button @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
            <span class="text-xl">🚪</span>
            <span class="font-medium">Sair</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 min-h-screen">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div class="px-8 py-4">
          <h1 class="text-2xl font-bold">Meu Perfil</h1>
          <p class="text-sm text-slate-400">Gere as tuas informações profissionais</p>
        </div>
      </header>

      <div class="p-8 max-w-6xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Profile Content -->
        <div v-else class="space-y-6">
          <!-- Info Básica -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold mb-1">Informações Básicas</h2>
                <p class="text-slate-400 text-sm">Dados pessoais e de contacto</p>
              </div>
              <button v-if="!editingBasic" @click="editingBasic = true"
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
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-sm text-slate-500">Nome</label>
                  <p class="text-lg">{{ user.name || 'Não definido' }}</p>
                </div>
                <div>
                  <label class="text-sm text-slate-500">Email</label>
                  <p class="text-lg">{{ user.email }}</p>
                </div>
                <div v-if="profile">
                  <label class="text-sm text-slate-500">Telefone</label>
                  <p class="text-lg">{{ profile.phone || 'Não definido' }}</p>
                </div>
                <div v-if="profile">
                  <label class="text-sm text-slate-500">Localização</label>
                  <p class="text-lg">{{ profile.location || 'Não definido' }}</p>
                </div>
              </div>

              <div v-if="profile">
                <label class="text-sm text-slate-500">Headline</label>
                <p class="text-lg">{{ profile.headline || 'Não definido' }}</p>
              </div>

              <div v-if="profile">
                <label class="text-sm text-slate-500">Sumário Profissional</label>
                <p class="text-slate-300 leading-relaxed">{{ profile.summary || 'Não definido' }}</p>
              </div>

              <div v-if="profile" class="grid grid-cols-3 gap-6">
                <div>
                  <label class="text-sm text-slate-500">Website</label>
                  <p class="text-lg">{{ profile.website || 'Não definido' }}</p>
                </div>
                <div>
                  <label class="text-sm text-slate-500">LinkedIn</label>
                  <p class="text-lg">{{ profile.linkedin || 'Não definido' }}</p>
                </div>
                <div>
                  <label class="text-sm text-slate-500">GitHub</label>
                  <p class="text-lg">{{ profile.github || 'Não definido' }}</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nome</label>
                  <input v-model="user.name" type="text"
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all">
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

          <!-- Experiências -->
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
            <div v-if="profile">
              <div v-if="profile.experiences && profile.experiences.length > 0" class="space-y-4">
                <div v-for="exp in profile.experiences" :key="exp.id"
                  class="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-lg font-bold">{{ exp.jobTitle }}</h3>
                      <p class="text-blue-400">{{ exp.company }}</p>
                      <p class="text-sm text-slate-500">{{ formatDate(exp.startDate) }} - {{ exp.isCurrent ? 'Atual' :
                        formatDate(exp.endDate) }}</p>
                      <p class="text-sm text-slate-500">{{ exp.location }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button @click="editExperience(exp)"
                        class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                      <button @click="deleteExperience(exp.id)"
                        class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                    </div>
                  </div>
                  <p class="text-slate-300 mb-3">{{ exp.description }}</p>
                  <div v-if="exp.achievements && exp.achievements.length > 0" class="mb-3">
                    <p class="text-sm font-semibold text-slate-400 mb-2">Conquistas:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-slate-400">
                      <li v-for="(achievement, i) in exp.achievements" :key="i">{{ achievement }}</li>
                    </ul>
                  </div>
                  <div v-if="exp.skills && exp.skills.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="skill in exp.skills" :key="skill"
                      class="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm">
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-slate-500">
                <p class="text-lg mb-2">Ainda não tens experiências adicionadas</p>
                <p class="text-sm">Clica em "Adicionar" para começar</p>
              </div>
            </div>

          </div>

          <!-- Formação -->
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

            <div v-if="profile">
              <div v-if="profile.educations && profile.educations.length > 0" class="space-y-4">
                <div v-for="edu in profile.educations" :key="edu.id"
                  class="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-lg font-bold">{{ edu.degree }}</h3>
                      <p class="text-blue-400">{{ edu.institution }}</p>
                      <p class="text-sm text-slate-500">{{ edu.fieldOfStudy }}</p>
                      <p class="text-sm text-slate-500">{{ formatDate(edu.startDate) }} - {{ edu.isCurrent ? 'Atual' :
                        formatDate(edu.endDate) }}</p>
                      <p v-if="edu.grade" class="text-sm text-slate-500">Nota: {{ edu.grade }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button @click="editEducation(edu)"
                        class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                      <button @click="deleteEducation(edu.id)"
                        class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                    </div>
                  </div>
                  <p v-if="edu.description" class="text-slate-300">{{ edu.description }}</p>
                </div>
              </div>
              <div v-else class="text-center py-12 text-slate-500">
                <p class="text-lg mb-2">Ainda não tens formações adicionadas</p>
                <p class="text-sm">Clica em "Adicionar" para começar</p>
              </div>
            </div>

          </div>

          <!-- Competências -->
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

            <div v-if="profile">
              <div v-if="profile.skills && profile.skills.length > 0">
                <div v-for="category in skillsByCategory" :key="category.name" class="mb-6 last:mb-0">
                  <h3 class="text-sm font-semibold text-slate-400 mb-3">{{ category.name }}</h3>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="skill in category.skills" :key="skill.id"
                      class="group relative px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/30 transition-all">
                      <div class="flex items-center gap-2">
                        <span>{{ skill.name }}</span>
                        <span v-if="skill.level" class="text-xs text-slate-500">{{ '⭐'.repeat(skill.level) }}</span>
                        <button @click="deleteSkill(skill.id)"
                          class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all ml-2">×</button>
                      </div>
                      <span v-if="skill.yearsOfExp" class="text-xs text-slate-500">{{ skill.yearsOfExp }} anos</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-slate-500">
                <p class="text-lg mb-2">Ainda não tens competências adicionadas</p>
                <p class="text-sm">Clica em "Adicionar" para começar</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Adicionar Experiência -->
    <div v-if="showAddExperience"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Adicionar Experiência</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Cargo *</label>
            <input v-model="newExperience.jobTitle" type="text"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Empresa *</label>
            <input v-model="newExperience.company" type="text"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Localização</label>
            <input v-model="newExperience.location" type="text"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
          </div>
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
          <div>
            <label class="flex items-center gap-2">
              <input v-model="newExperience.isCurrent" type="checkbox" class="w-4 h-4">
              <span class="text-sm">Trabalho aqui atualmente</span>
            </label>
          </div>
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
          <button @click="showAddExperience = false"
            class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Adicionar Formação -->
    <div v-if="showAddEducation"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Adicionar Formação</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Grau *</label>
            <input v-model="newEducation.degree" type="text" placeholder="Ex: Mestrado em Engenharia Informática"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Instituição *</label>
            <input v-model="newEducation.institution" type="text"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Área de Estudo</label>
            <input v-model="newEducation.fieldOfStudy" type="text"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
          </div>
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
          <div>
            <label class="flex items-center gap-2">
              <input v-model="newEducation.isCurrent" type="checkbox" class="w-4 h-4">
              <span class="text-sm">A estudar atualmente</span>
            </label>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="saveEducation"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
            Guardar
          </button>
          <button @click="showAddEducation = false"
            class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Adicionar Skill -->
    <div v-if="showAddSkill"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6">Adicionar Competência</h2>
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
        <div class="flex gap-3 mt-6">
          <button @click="saveSkill"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-semibold">
            Guardar
          </button>
          <button @click="showAddSkill = false"
            class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useProfileStore } from '../stores/profile'
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";


export default {
  name: 'Profile',
  setup() {
    const store = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
      await store.logout();
      router.push("/login");
      window.location.reload();
    };

     return {
      store,
      router,
      handleLogout,
    };
  },
  data() {
    return {
      loading: true,
      editingBasic: false,
      showAddExperience: false,
      showAddEducation: false,
      showAddSkill: false,

      user: {
        name: '',
        email: ''
      },

      profile: {
        headline: '',
        summary: '',
        location: '',
        phone: '',
        website: '',
        linkedin: '',
        github: '',
        experiences: [],
        educations: [],
        skills: []
      },

      editForm: {},

      newExperience: {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      },

      newEducation: {
        degree: '',
        institution: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        isCurrent: false
      },

      newSkill: {
        name: '',
        category: 'Frontend',
        level: 3,
        yearsOfExp: 0
      }
    }
  },

  computed: {
    skillsByCategory() {
      const categories = {}
      this.profile.skills.forEach(skill => {
        const cat = skill.category || 'Outros'
        if (!categories[cat]) {
          categories[cat] = []
        }
        categories[cat].push(skill)
      })

      return Object.keys(categories).map(name => ({
        name,
        skills: categories[name]
      }))
    }
  },

  async mounted() {
    await this.loadProfile()
  },

  methods: {
    async loadProfile() {
      try {
        const profileStore = useProfileStore()

        // Busca user, profile e billing do store
        await profileStore.getMe()

        // Atribui ao componente localmente
        this.user = profileStore.user
        this.profile = profileStore.user ? profileStore.user.profile : null
        this.billing = profileStore.billing

        this.loading = false
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        this.$toast.error('Erro ao carregar perfil')
        this.loading = false
      }
    },
  },

  // ========================================
  // BASIC PROFILE
  // ========================================

  startEditBasic() {
    this.editForm = { ...this.profile }
    this.editingBasic = true
  },

  cancelEditBasic() {
    this.editingBasic = false
    this.editForm = {}
  },

  async saveBasicInfo() {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        '/api/profiles/me',
        this.editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile = { ...this.profile, ...response.data.data.profile }
      this.editingBasic = false
      this.$toast.success('Perfil atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
    }
  },

  // ========================================
  // EXPERIENCES
  // ========================================

  async addExperience() {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        '/api/profiles/experiences',
        this.newExperience,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.experiences.push(response.data.data.experience)
      this.showAddExperience = false
      this.resetNewExperience()
      this.$toast.success('Experiência adicionada com sucesso')
    } catch (error) {
      console.error('Erro ao adicionar experiência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao adicionar experiência')
    }
  },

  async updateExperience(experience) {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `/api/profiles/experiences/${experience.id}`,
        experience,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const index = this.profile.experiences.findIndex(e => e.id === experience.id)
      if (index !== -1) {
        this.profile.experiences[index] = response.data.data.experience
      }

      this.$toast.success('Experiência atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar experiência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao atualizar experiência')
    }
  },

  async deleteExperience(experienceId) {
    if (!confirm('Tem certeza que deseja remover esta experiência?')) return

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(
        `/api/profiles/experiences/${experienceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.experiences = this.profile.experiences.filter(e => e.id !== experienceId)
      this.$toast.success('Experiência removida com sucesso')
    } catch (error) {
      console.error('Erro ao remover experiência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao remover experiência')
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
      description: ''
    }
  },

  // ========================================
  // EDUCATION
  // ========================================

  async addEducation() {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        '/api/profiles/education',
        this.newEducation,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.educations.push(response.data.data.education)
      this.showAddEducation = false
      this.resetNewEducation()
      this.$toast.success('Formação adicionada com sucesso')
    } catch (error) {
      console.error('Erro ao adicionar formação:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao adicionar formação')
    }
  },

  async updateEducation(education) {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `/api/profiles/education/${education.id}`,
        education,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const index = this.profile.educations.findIndex(e => e.id === education.id)
      if (index !== -1) {
        this.profile.educations[index] = response.data.data.education
      }

      this.$toast.success('Formação atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar formação:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao atualizar formação')
    }
  },

  async deleteEducation(educationId) {
    if (!confirm('Tem certeza que deseja remover esta formação?')) return

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(
        `/api/profiles/education/${educationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.educations = this.profile.educations.filter(e => e.id !== educationId)
      this.$toast.success('Formação removida com sucesso')
    } catch (error) {
      console.error('Erro ao remover formação:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao remover formação')
    }
  },

  resetNewEducation() {
    this.newEducation = {
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    }
  },

  // ========================================
  // SKILLS
  // ========================================

  async addSkill() {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        '/api/profiles/skills',
        this.newSkill,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.skills.push(response.data.data.skill)
      this.showAddSkill = false
      this.resetNewSkill()
      this.$toast.success('Competência adicionada com sucesso')
    } catch (error) {
      console.error('Erro ao adicionar competência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao adicionar competência')
    }
  },

  async updateSkill(skill) {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `/api/profiles/skills/${skill.id}`,
        skill,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const index = this.profile.skills.findIndex(s => s.id === skill.id)
      if (index !== -1) {
        this.profile.skills[index] = response.data.data.skill
      }

      this.$toast.success('Competência atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar competência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao atualizar competência')
    }
  },

  async deleteSkill(skillId) {
    if (!confirm('Tem certeza que deseja remover esta competência?')) return

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(
        `/api/profiles/skills/${skillId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      this.profile.skills = this.profile.skills.filter(s => s.id !== skillId)
      this.$toast.success('Competência removida com sucesso')
    } catch (error) {
      console.error('Erro ao remover competência:', error)
      this.$toast.error(error.response?.data?.message || 'Erro ao remover competência')
    }
  },

  resetNewSkill() {
    this.newSkill = {
      name: '',
      category: 'Frontend',
      level: 3,
      yearsOfExp: 0
    }
  },

  // ========================================
  // HELPERS
  // ========================================

  formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short'
    })
  },

  getSkillLevelText(level) {
    const levels = {
      1: 'Básico',
      2: 'Iniciante',
      3: 'Intermédio',
      4: 'Avançado',
      5: 'Expert'
    }
    return levels[level] || 'Intermédio'
  }
}

</script>