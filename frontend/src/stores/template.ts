// src/stores/template.ts
import { defineStore } from 'pinia'
import * as templateApi from '../api/template'
import { TemplateState } from '../types/templateInterface'


export const useTemplateStore = defineStore('template', {
  state: (): TemplateState => ({
    templates: [],
    categorized: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTemplates() {
      this.loading = true
      this.error = null

      try {
        const res = await templateApi.getAllTemplates()

        // Corrigido para acessar a estrutura correta:
        this.templates = res.data?.data?.templates || []
      } catch (err: any) {
        console.error('❌ Erro ao buscar templates:', err)
        this.error = err.message || 'Erro ao buscar templates'
      } finally {
        this.loading = false
      }
    },
  },
})