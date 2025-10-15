import { LoginData, RegisterData } from '../types/authInterface';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL + '/auth';

export const register = (data: RegisterData) =>
  axios.post(`${BASE_URL}/register`, data);

export const login = (data: LoginData) =>
  axios.post(`${BASE_URL}/login`, data);

export const logout = (refreshToken: string) =>
  axios.post(`${BASE_URL}/logout`, { refreshToken });

export const refresh = (refreshToken: string) =>
  axios.post(`${BASE_URL}/refresh`, { refreshToken });

export const googleLogin = () => {
  window.location.href = `${BASE_URL}/google`;
};
