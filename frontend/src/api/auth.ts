import { LoginData, RegisterData } from '../types/authInterface';
import api from '../services/axios'

const BASE_URL = '/auth';

export const register = (data: RegisterData) =>
  api.post(`${BASE_URL}/register`, data);

export const login = (data: LoginData) =>
  api.post(`${BASE_URL}/login`, data);

export const logout = (refreshToken: string) =>
  api.post(`${BASE_URL}/logout`, { refreshToken });

export const refresh = (refreshToken: string) =>
  api.post(`${BASE_URL}/refresh`, { refreshToken });

export const googleLogin = () => {
  window.location.href = `${BASE_URL}/google`;
};
