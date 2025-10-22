// src/stores/cv.ts
import { defineStore } from 'pinia';
import * as cvApi from '../api/cv';
import { useAuthStore } from './auth';
import { CV } from '../types/cvInterface';

export const useCVStore = defineStore('cv', {
  state: () => ({
    cvs: [] as CV[],
    currentCV: null as CV | null,
    loading: false,
  }),

  getters: {
    publishedCVs: (state) => state.cvs.filter(cv => cv.status === 'PUBLISHED'),
    draftCVs: (state) => state.cvs.filter(cv => cv.status === 'DRAFT'),
    archivedCVs: (state) => state.cvs.filter(cv => cv.status === 'ARCHIVED'),
  },

  actions: {
    async fetchCVs(params?: { status?: string; search?: string; sortBy?: string; order?: string }) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      this.loading = true;
      try {
        const response = await cvApi.getCVs(authStore.accessToken, params);
        this.cvs = response.data.data.cvs || [];
      } catch (error) {
        console.error('Erro ao buscar CVs:', error);
        this.cvs = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchCVById(id: string) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      try {
        const response = await cvApi.getCVById(authStore.accessToken, id);
        this.currentCV = response.data.data.cv;
      } catch (error) {
        console.error('Erro ao buscar CV:', error);
        this.currentCV = null;
      }
    },

    async createCV(data: Partial<CV>) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const response = await cvApi.createCV(authStore.accessToken, data);
      const newCV = response.data.data.cv;
      this.cvs.push(newCV);
      return newCV;
    },

    async updateCV(id: string, data: Partial<CV>) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const response = await cvApi.updateCV(authStore.accessToken, id, data);
      const updatedCV = response.data.data.cv;
      const index = this.cvs.findIndex(cv => cv.id === id);
      if (index !== -1) this.cvs[index] = updatedCV;
      return updatedCV;
    },

    async deleteCV(id: string) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      await cvApi.deleteCV(authStore.accessToken, id);
      this.cvs = this.cvs.filter(cv => cv.id !== id);
    },

    async duplicateCV(id: string) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const response = await cvApi.duplicateCV(authStore.accessToken, id);
      const duplicated = response.data.data.cv;
      this.cvs.push(duplicated);
      return duplicated;
    },

    async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const response = await cvApi.updateStatus(authStore.accessToken, id, status);
      const updatedCV = response.data.data.cv;
      const index = this.cvs.findIndex(cv => cv.id === id);
      if (index !== -1) this.cvs[index] = updatedCV;
      return updatedCV;
    },

    async changeTemplate(id: string, templateId: string) {
      const authStore = useAuthStore();
      if (!authStore.accessToken) return;

      const response = await cvApi.changeTemplate(authStore.accessToken, id, templateId);
      const updatedCV = response.data.data.cv;
      const index = this.cvs.findIndex(cv => cv.id === id);
      if (index !== -1) this.cvs[index] = updatedCV;
      return updatedCV;
    },
  },
});
