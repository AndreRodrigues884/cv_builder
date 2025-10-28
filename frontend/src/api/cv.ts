import { CV } from '../types/cvInterface';
import api from '../services/axios';

const BASE_URL = '/cv'; 

export const getCVs = (params?: { 
  status?: string; 
  search?: string; 
  sortBy?: string; 
  order?: string;
}) => api.get(BASE_URL, { params });

export const getCVById = (id: string) => 
  api.get(`${BASE_URL}/${id}`);

export const createCV = (data: Partial<CV>) => 
  api.post(BASE_URL, data);

export const updateCV = (id: string, data: Partial<CV>) => 
  api.put(`${BASE_URL}/${id}`, data);

export const deleteCV = (id: string) => 
  api.delete(`${BASE_URL}/${id}`);

export const duplicateCV = (id: string) => 
  api.post(`${BASE_URL}/${id}/duplicate`, {});

export const updateStatus = (
  id: string, 
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
) => api.patch(`${BASE_URL}/${id}/status`, { status });

export const changeTemplate = (id: string, templateId: string) => 
  api.patch(`${BASE_URL}/${id}/template`, { templateId });


  export const downloadCVPDF = async (id: string) => {
  return api.get(`${BASE_URL}/${id}/download/pdf`, {
    responseType: 'blob', // muito importante para ficheiros binários
  });
};