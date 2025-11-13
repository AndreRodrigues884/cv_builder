import { CV } from '../types/cvInterface';
import api from '../services/axios';

const BASE_URL = '/cv';

const cvApi = {
  getCVs: (params?: {
    status?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }) => api.get(BASE_URL, { params }),

  getCVById: (id: string) => api.get(`${BASE_URL}/${id}`),

  createCV: (data: Partial<CV>) => api.post(BASE_URL, data),

  updateCV: (id: string, data: Partial<CV>) => api.put(`${BASE_URL}/${id}`, data),

  deleteCV: (id: string) => api.delete(`${BASE_URL}/${id}`),

  updateStatus: (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') =>
    api.patch(`${BASE_URL}/${id}/status`, { status }),

  changeTemplate: (id: string, templateId: string) =>
    api.patch(`${BASE_URL}/${id}/template`, { templateId }),

  previewCV: (id: string) =>
    api.get(`${BASE_URL}/${id}/preview`, {
      responseType: 'text', // Retorna HTML como texto
    }),

  downloadCV: async (id: string) => {
    // Retorna o blob do PDF diretamente
    return api.get(`${BASE_URL}/${id}/download/pdf`, {
      responseType: 'blob', // muito importante
    });
  },
};

export default cvApi;
