import { defineStore } from 'pinia';
import cvApi from '../api/cv';
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

        this.cvs = response.data.data.cvs;

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
        this.currentCV = response.data.data.cv;
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
        this.cvs.push(response.data.data.cv);
        this.currentCV = response.data.data.cv;
        return { success: true, cv: response.data.data.cv };
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
        const cvResposta = response.data.data.cv;
        const index = this.cvs.findIndex(cv => cv.id === id);
        if (index !== -1) this.cvs[index] = cvResposta;
        if (this.currentCV?.id === id) this.currentCV = cvResposta;
        return { success: true, cv: cvResposta };
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

    /* async downloadCV(id: string) {
      this.loading = true;
      this.error = null;

      try {
        // Garantir que id é uma string
        const cvId = typeof id === 'string' ? id : (id?.id || id?.toString());
        
        if (!cvId || typeof cvId !== 'string') {
          throw new Error('ID do CV inválido');
        }

        console.log('📥 Fazendo download do CV:', cvId);
        const response = await cvApi.downloadCV(cvId);
        console.log('📥 PDF recebido do backend:', response);

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const cv = this.cvs.find(c => c.id === cvId) || this.currentCV;
        const filename = cv ? `cv-${cv.title || cv.id}.pdf` : `cv-${cvId}.pdf`;
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename.replace(/[^a-zA-Z0-9]/g, '-'));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ PDF baixado com sucesso');
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao fazer download do CV';
        console.error('❌ Erro ao fazer download do CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    }, */

    async previewCV(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await cvApi.previewCV(id);
        return { success: true, html: response.data };
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Erro ao carregar preview do CV';
        console.error('❌ Erro ao carregar preview do CV:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },




  },
});