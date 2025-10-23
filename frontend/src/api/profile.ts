import axios from 'axios';
import { Certification, Education, Experience, Project, Skill } from '../types/profileInterface';
import { Profile } from '../types/userInterface';

const BASE_URL = import.meta.env.VITE_API_URL + '/profile';

export const getMe = (accessToken: string) =>
  axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateProfile = (accessToken: string, profileData: Partial<Profile>) =>
  axios.put(`${BASE_URL}/update`, profileData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addExperience = (accessToken: string, experienceData: Experience) =>
  axios.post(`${BASE_URL}/experiences`, experienceData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateExperience = (accessToken: string, id: string, experienceData: Partial<Experience>) =>
  axios.put(`${BASE_URL}/experiences/${id}`, experienceData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteExperience = (accessToken: string, id: string) =>
  axios.delete(`${BASE_URL}/experiences/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addEducation = (accessToken: string, educationData: Education) =>
  axios.post(`${BASE_URL}/education`, educationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

// Partial permite que todos os campos sejam opcionais
export const updateEducation = (accessToken: string, id: string, educationData: Partial<Education>) =>
  axios.put(`${BASE_URL}/education/${id}`, educationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteEducation = (accessToken: string, id: string) =>
  axios.delete(`${BASE_URL}/education/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addSkill = (accessToken: string, skillData: Skill) =>
  axios.post(`${BASE_URL}/skills`, skillData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateSkill = (accessToken: string, id: string, skillData: Partial<Skill>) =>
  axios.put(`${BASE_URL}/skills/${id}`, skillData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteSkill = (accessToken: string, id: string) =>
  axios.delete(`${BASE_URL}/skills/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addCertification = (accessToken: string, certificationData: Certification) =>
  axios.post(`${BASE_URL}/certifications`, certificationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateCertification = (accessToken: string, id: string, certificationData: Certification) =>
  axios.put(`${BASE_URL}/certifications/${id}`, certificationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const deleteCertification = (accessToken: string, id: string) =>
  axios.delete(`${BASE_URL}/certifications/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const addProject = (accessToken: string, projectData: Project) =>
  axios.post(`${BASE_URL}/projects`, projectData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const updateProject = (accessToken: string, id: string, projectData: Project) =>
  axios.put(`${BASE_URL}/projects/${id}`, projectData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  export const deleteProject = (accessToken: string, id: string) =>
  axios.delete(`${BASE_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });