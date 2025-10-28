import { defineStore } from 'pinia';
import * as cvApi from '../api/cv';
import { CV, CVState } from '../types/cvInterface';

export const useCVStore = defineStore('cv', {
  state: (): CVState => ({
    cvs: [] as CV[],
    currentCV: null,
    loading: false,
    error: null,
  }),

  getters: {
    allCVs: (state) => state.cvs, // todos os CVs

    stats: (state) => ({
      total: (state.cvs || []).length,
      published: (state.cvs || []).filter(cv => cv.status === 'PUBLISHED').length,
      draft: (state.cvs || []).filter(cv => cv.status === 'DRAFT').length,
      archived: (state.cvs || []).filter(cv => cv.status === 'ARCHIVED').length,
    }),
  },

  actions: {
    async fetchCVs(filters?: { status?: string; search?: string }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await cvApi.getCVs(filters);

        // Guarda os CVs na store
        this.cvs = response.data.cvs; // <-- importante!

        return response.data; // opcional
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao carregar CVs';
        console.error('Erro ao buscar CVs:', error);
      } finally {
        this.loading = false;
      }
    },

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

    async downloadCVPDF(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await cvApi.downloadCVPDF(id);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cv-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao descarregar PDF';
        console.error('Erro ao descarregar PDF:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

  },
});