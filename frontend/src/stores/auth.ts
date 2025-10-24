import { defineStore } from 'pinia';
import * as authApi from '../api/auth';
import * as profileApi from '../api/profile'; // ← ADICIONAR
import { AuthState } from '../types/authInterface';
import { User } from '../types/userInterface';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    profile: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    billing: null, // ← ADICIONAR
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isPro: (state) => state.billing?.plan === 'PRO',
    isPremium: (state) => state.billing?.plan === 'PREMIUM',
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },

  actions: {
    async register(name: string, email: string, password: string) {
      const res = await authApi.register({ name, email, password });
      this.setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      await this.fetchBilling(); // ← ADICIONAR
    },

    async login(email: string, password: string) {
      const res = await authApi.login({ email, password });
      this.setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      await this.fetchBilling(); // ← ADICIONAR
      return this.user;
    },

    async logout() {
      if (this.refreshToken) {
        await authApi.logout(this.refreshToken);
      }
      this.clearSession();
    },

    setSession(user: User, accessToken: string, refreshToken: string) {
      this.user = user;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },

    clearSession() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.billing = null; // ← ADICIONAR
      localStorage.clear();
    },

    async fetchBilling() {
      try {
        if (!this.accessToken) return;
        
        const response = await profileApi.getMe(this.accessToken);
        this.billing = response.data.data.billing;
      } catch (error) {
        console.error('Erro ao buscar billing:', error);
        // Não falhar se billing não existir (usuário novo)
        this.billing = null;
      }
    },
  },
  
  persist: true,
});