import { defineStore } from 'pinia';
import * as authApi from '../api/user';
import { AuthState } from '../types/authInterface';

export const useUserStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),

  actions: {
    async getMe() {
      try {
        if (!this.accessToken) {
          this.user = null;
          return null;
        }

        const response = await authApi.getMe(this.accessToken);

        // Supondo que a resposta da API tenha data.user
        this.user = response.data.user;

        return this.user;
      } catch (error) {
        console.error('Erro ao buscar utilizador logado:', error);
        this.user = null;
        return null;
      }
    },
  },
});
