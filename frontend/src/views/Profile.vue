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

      <div class="flex flex-col p-8 max-w-6xl gap-8 mx-auto">
        <!-- Profile Content -->
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
                  <p class="text-lg truncate ">{{ profile.website || 'Não definido' }}</p>
                </div>
                <div>
                  <label class="text-sm text-slate-500">LinkedIn</label>
                  <p class="text-lg truncate ">{{ profile.linkedin || 'Não definido' }}</p>
                </div>
                <div>
                  <label class="text-sm text-slate-500">GitHub</label>
                  <p class="text-lg truncate ">{{ profile.github || 'Não definido' }}</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nome</label>
                  <p class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300">
                    {{ user.name || 'Não definido' }}
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
                      <h3 class="text-lg font-bold break-words">{{ exp.jobTitle }}</h3>
                      <p class="text-blue-400 truncate w-full" :title="exp.company">{{ exp.company }}</p>
                      <p class="text-sm text-slate-500">
                        {{ formatDate(exp.startDate) }} - {{ exp.isCurrent ? 'Atual' : formatDate(exp.endDate) }}
                      </p>
                      <p class="text-sm text-slate-500 truncate w-full" :title="exp.location">{{ exp.location }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button @click="editExperience(exp)"
                        class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                      <button @click="deleteExperience(exp.id)"
                        class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                    </div>
                  </div>
                  <p class="text-slate-300 mb-3 break-words">{{ exp.description }}</p>
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
          <div
            class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      <h3 class="text-lg font-bold break-words">{{ edu.degree }}</h3>
                      <p class="text-blue-400 truncate w-full" :title="edu.institution">{{ edu.institution }}</p>
                      <p class="text-sm text-slate-500">{{ edu.fieldOfStudy }}</p>
                      <p class="text-sm text-slate-500">
                        {{ formatDate(edu.startDate) }} - {{ edu.isCurrent ? 'Atual' : formatDate(edu.endDate) }}
                      </p>
                      <p v-if="edu.grade" class="text-sm text-slate-500">Nota: {{ edu.grade }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button @click="editEducation(edu)"
                        class="p-2 hover:bg-slate-700 rounded-lg transition-all">✏️</button>
                      <button @click="deleteEducation(edu.id)"
                        class="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all">🗑️</button>
                    </div>
                  </div>
                  <p v-if="edu.description" class="text-slate-300 break-words">{{ edu.description }}</p>
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
          <div
            class="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <button @click="showAddEducation = false; resetNewEducation()"
                class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>




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
                      <h3 class="text-lg font-bold break-words">{{ skill.name }}</h3>
                      <p class="text-sm text-slate-500">Categoria: {{ skill.category }}</p>
                      <p class="text-sm text-slate-500">Nível: {{ '⭐'.repeat(skill.level) }}</p>
                      <p v-if="skill.yearsOfExp" class="text-sm text-slate-500">Experiência: {{ skill.yearsOfExp }} anos
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

      </div>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'

export default {
  name: 'Profile',

  data() {
    return {
      // Estados locais
      editingBasic: false,
      loading: true,
      user: null,
      profile: null,
      billing: null,

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
    // Acesso direto às stores
    authStore() {
      return useAuthStore()
    },
    profileStore() {
      return useProfileStore()
    },
  },

  methods: {
    async handleLogout() {
      await this.authStore.logout()
      this.$router.push('/login')
      window.location.reload()
    },

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

    async loadProfile() {
      try {
        await this.profileStore.getMe()
        this.user = this.profileStore.user
        this.profile = this.profileStore.profile
        this.billing = this.profileStore.billing

      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        this.loading = false
      }
    },


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
      this.newExperience = { ...exp } // clona os dados
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


  },

  mounted() {
    this.loadProfile();
  },
}
</script>