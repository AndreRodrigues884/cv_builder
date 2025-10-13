// frontend/src/stores/cv.ts
import { defineStore } from 'pinia'
import cvService from '../services/cvService'
import type { CV } from '../types/cvInterface'
import { useAuthStore } from './auth'

export const useCVStore = defineStore('cv', {
  state: () => ({
    cvs: [] as CV[],
    selectedCV: null as CV | null,
  }),

  getters: {
    hasCVs: (state) => state.cvs.length > 0,
  },

  actions: {
    async fetchUserCVs() {
      try {
        const authStore = useAuthStore()
        if (!authStore.token) throw new Error('Usuário não autenticado')

        const data = await cvService.getUserCVs()
        this.cvs = data
      } catch (err) {
        console.error('Erro ao buscar CVs:', err)
      }
    },

    async createCV(cvData: CV) {
      try {
        const newCV = await cvService.createCV(cvData)
        this.cvs.push(newCV)
        this.selectedCV = newCV
      } catch (err) {
        console.error('Erro ao criar CV:', err)
        throw err
      }
    },

    async updateCV(id: string, cvData: CV) {
      try {
        const updated = await cvService.updateCV(id, cvData)
        const index = this.cvs.findIndex(cv => cv.id === id)
        if (index !== -1) this.cvs[index] = updated
        if (this.selectedCV?.id === id) this.selectedCV = updated
      } catch (err) {
        console.error('Erro ao atualizar CV:', err)
        throw err
      }
    },

    async deleteCV(id: string) {
      try {
        await cvService.deleteCV(id)
        this.cvs = this.cvs.filter(cv => cv.id !== id)
        if (this.selectedCV?.id === id) this.selectedCV = null
      } catch (err) {
        console.error('Erro ao deletar CV:', err)
        throw err
      }
    },

    selectCV(cv: CV) {
      this.selectedCV = cv
    }
  },
})
