// src/api/cv.ts
import axios from 'axios';
import { CV } from '../types/cvInterface';

const BASE_URL = import.meta.env.VITE_API_URL + '/cv';

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// GET /cv?status=DRAFT&search=...
export const getCVs = (
  token: string,
  params?: { status?: string; search?: string; sortBy?: string; order?: string }
) => axios.get(BASE_URL, { ...authHeader(token), params });

// GET /cv/:id
export const getCVById = (token: string, id: string) =>
  axios.get(`${BASE_URL}/${id}`, authHeader(token));

// POST /cv
export const createCV = (token: string, data: Partial<CV>) =>
  axios.post(BASE_URL, data, authHeader(token));

// PUT /cv/:id
export const updateCV = (token: string, id: string, data: Partial<CV>) =>
  axios.put(`${BASE_URL}/${id}`, data, authHeader(token));

// DELETE /cv/:id
export const deleteCV = (token: string, id: string) =>
  axios.delete(`${BASE_URL}/${id}`, authHeader(token));

// POST /cv/:id/duplicate
export const duplicateCV = (token: string, id: string) =>
  axios.post(`${BASE_URL}/${id}/duplicate`, {}, authHeader(token));

// PATCH /cv/:id/status
export const updateStatus = (token: string, id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') =>
  axios.patch(`${BASE_URL}/${id}/status`, { status }, authHeader(token));

// PATCH /cv/:id/template
export const changeTemplate = (token: string, id: string, templateId: string) =>
  axios.patch(`${BASE_URL}/${id}/template`, { templateId }, authHeader(token));
