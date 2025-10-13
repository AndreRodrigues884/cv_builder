// frontend/src/stores/auth.ts
import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import type { AuthResponse, Credentials, RegisterData, User } from '../types/authInterface'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async register(userData: RegisterData) {
      try {
        const response = await axios.post<AuthResponse>(
          `${import.meta.env.VITE_API_URL}/api/auth/register`,
          userData
        )
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        const err = error as AxiosError
        throw err.response?.data || err.message
      }
    },

    async login(credentials: Credentials) {
      try {
        const response = await axios.post<AuthResponse>(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          credentials
        )
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        const err = error as AxiosError
        throw err.response?.data || err.message
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
  },
})
