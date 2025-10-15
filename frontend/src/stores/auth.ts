import { defineStore } from 'pinia';
import * as authApi from '../api/auth';
import { AuthState } from '../types/authInterface';
import { User } from '../types/userInterface';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),

  actions: {
    async register(name: string, email: string, password: string) {
      const res = await authApi.register({ name, email, password });
      this.setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
    },

    async login(email: string, password: string) {
      const res = await authApi.login({ email, password });
      this.setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
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
      localStorage.clear();
    },
  },
  persist: true,
});