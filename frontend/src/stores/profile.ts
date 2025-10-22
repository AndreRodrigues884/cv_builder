import { defineStore } from 'pinia';
import * as profileApi from '../api/profile';
import { AuthState } from '../types/authInterface';

export const useProfileStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    profile: null, // 👈 adiciona isto
    billing: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),

  actions: {
    async getMe() {
      try {
        if (!this.accessToken) {
          this.user = null;
          this.profile = null;
          this.billing = null;
          return null;
        }

        const response = await profileApi.getMe(this.accessToken);
        const data = response.data.data;

        // 👇 guarda todos os dados recebidos
        this.user = data.user;
        this.profile = data.profile;
        this.billing = data.billing ?? null;

        return data;
      } catch (error) {
        console.error('Erro ao buscar utilizador logado:', error);
        this.user = null;
        this.profile = null;
        this.billing = null;
        return null;
      }
    },
  },
});
