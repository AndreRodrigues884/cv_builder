import { defineStore } from 'pinia';
import * as cvApi from '../api/cv';
import { CV, CVState } from '../types/cvInterface';

export const useCVStore = defineStore('cv', {
  state: (): CVState => ({
    cvs: [],
    currentCV: null,
    loading: false,
    error: null,
  }),

  getters: {
    draftCVs: (state) => state.cvs.filter(cv => cv.status === 'DRAFT'),
    publishedCVs: (state) => state.cvs.filter(cv => cv.status === 'PUBLISHED'),
    archivedCVs: (state) => state.cvs.filter(cv => cv.status === 'ARCHIVED'),
  },

  actions: {
    // ========================================
    // LISTAR CVs
    // ========================================
    async fetchCVs(filters?: { status?: string; search?: string }) {
      this.loading = true;
      this.error = null;
      
      try {
        // ✅ SEM passar token - interceptor faz isso automaticamente!
        const response = await cvApi.getCVs(filters);
        this.cvs = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao carregar CVs';
        console.error('Erro ao buscar CVs:', error);
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // BUSCAR CV POR ID
    // ========================================
    async fetchCVById(id: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await cvApi.getCVById(id);
        this.currentCV = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'CV não encontrado';
        console.error('Erro ao buscar CV:', error);
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // CRIAR NOVO CV
    // ========================================
    async createCV(cvData: Partial<CV>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await cvApi.createCV(cvData);
        this.cvs.push(response.data);
        this.currentCV = response.data;
        return { success: true, cv: response.data };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao criar CV';
        console.error('Erro ao criar CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // ATUALIZAR CV
    // ========================================
    async updateCV(id: string, cvData: Partial<CV>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await cvApi.updateCV(id, cvData);
        const index = this.cvs.findIndex(cv => cv.id === id);
        if (index !== -1) this.cvs[index] = response.data;
        if (this.currentCV?.id === id) this.currentCV = response.data;
        return { success: true, cv: response.data };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao atualizar CV';
        console.error('Erro ao atualizar CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // APAGAR CV
    // ========================================
    async deleteCV(id: string) {
      this.loading = true;
      this.error = null;
      
      try {
        await cvApi.deleteCV(id);
        this.cvs = this.cvs.filter(cv => cv.id !== id);
        if (this.currentCV?.id === id) this.currentCV = null;
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao apagar CV';
        console.error('Erro ao apagar CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // DUPLICAR CV
    // ========================================
    async duplicateCV(id: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await cvApi.duplicateCV(id);
        this.cvs.push(response.data);
        return { success: true, cv: response.data };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao duplicar CV';
        console.error('Erro ao duplicar CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // MUDAR STATUS
    // ========================================
    async changeStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await cvApi.updateStatus(id, status);
        const index = this.cvs.findIndex(cv => cv.id === id);
        if (index !== -1) this.cvs[index] = response.data;
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao mudar status';
        console.error('Erro ao mudar status:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // EXPORTAR CV
    // ========================================
    async exportCV(id: string, format: 'PDF' | 'DOCX' = 'PDF') {
      try {
        const response = await cvApi.exportCV(id, format);
        
        // Cria link de download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cv-${id}.${format.toLowerCase()}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao exportar CV';
        console.error('Erro ao exportar CV:', error);
        return { success: false, message: this.error };
      }
    },
  },
});