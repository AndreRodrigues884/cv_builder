import { Certification, Education, Experience, Project, Skill } from '../types/profileInterface';
import { Profile } from '../types/userInterface';
import api from '../services/axios'

const BASE_URL = '/profile';

export const getMe = (accessToken: string) =>
  api.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateProfile = (accessToken: string, profileData: Partial<Profile>) =>
  api.put(`${BASE_URL}/update`, profileData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addExperience = (accessToken: string, experienceData: Experience) =>
  api.post(`${BASE_URL}/experiences`, experienceData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateExperience = (accessToken: string, id: string, experienceData: Partial<Experience>) =>
  api.put(`${BASE_URL}/experiences/${id}`, experienceData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteExperience = (accessToken: string, id: string) =>
  api.delete(`${BASE_URL}/experiences/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addEducation = (accessToken: string, educationData: Education) =>
  api.post(`${BASE_URL}/education`, educationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

// Partial permite que todos os campos sejam opcionais
export const updateEducation = (accessToken: string, id: string, educationData: Partial<Education>) =>
  api.put(`${BASE_URL}/education/${id}`, educationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteEducation = (accessToken: string, id: string) =>
  api.delete(`${BASE_URL}/education/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addSkill = (accessToken: string, skillData: Skill) =>
  api.post(`${BASE_URL}/skills`, skillData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateSkill = (accessToken: string, id: string, skillData: Partial<Skill>) =>
  api.put(`${BASE_URL}/skills/${id}`, skillData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteSkill = (accessToken: string, id: string) =>
  api.delete(`${BASE_URL}/skills/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addCertification = (accessToken: string, certificationData: Certification) =>
  api.post(`${BASE_URL}/certifications`, certificationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateCertification = (accessToken: string, id: string, certificationData: Certification) =>
  api.put(`${BASE_URL}/certifications/${id}`, certificationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteCertification = (accessToken: string, id: string) =>
  api.delete(`${BASE_URL}/certifications/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addProject = (accessToken: string, projectData: Project) =>
  api.post(`${BASE_URL}/projects`, projectData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateProject = (accessToken: string, id: string, projectData: Project) =>
  api.put(`${BASE_URL}/projects/${id}`, projectData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  export const deleteProject = (accessToken: string, id: string) =>
  api.delete(`${BASE_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });