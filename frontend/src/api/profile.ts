import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL + '/profile';

export const getMe = (accessToken: string) =>
  axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });