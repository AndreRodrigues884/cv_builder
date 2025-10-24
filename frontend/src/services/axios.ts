import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Flag para evitar múltiplas chamadas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ========================================
// REQUEST INTERCEPTOR
// ========================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    
    // Adiciona token automaticamente em todas as requests
    if (authStore.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================
api.interceptors.response.use(
  (response) => response, // Se sucesso, retorna normalmente
  
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const authStore = useAuthStore();

    // ========================================
    // CASO 1: Erro 401 (Token Expirado)
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já está tentando renovar, coloca na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Tenta renovar o token
      try {
        if (!authStore.refreshToken) {
          throw new Error('Refresh token não encontrado');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken: authStore.refreshToken }
        );

        const { accessToken, refreshToken } = response.data;

        // Atualiza tokens na store
        authStore.accessToken = accessToken;
        authStore.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Processa fila de requests pendentes
        processQueue(null, accessToken);

        // Atualiza header da request original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Reexecuta request original
        return api(originalRequest);

      } catch (refreshError) {
        // Se refresh falhar, desloga usuário
        processQueue(refreshError as Error, null);
        authStore.clearSession();
        router.push('/login');
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    // ========================================
    // CASO 2: Erro 403 (Sem Permissão)
    // ========================================
    if (error.response?.status === 403) {
      console.error('❌ Acesso negado (403)');
      
      // Se for erro de "user não encontrado", desloga
      if ((error.response.data as { error?: string })?.error?.includes('não encontrado')) {
        authStore.clearSession();
        router.push('/login');
      }
    }

    // ========================================
    // CASO 3: Erro 500 (Servidor)
    // ========================================
    if (error.response?.status === 500) {
      console.error('❌ Erro no servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;