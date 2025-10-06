// frontend/src/services/cvService.ts
import axios from 'axios'
import type { CV } from '../types/cvInterface'

const API_URL = 'http://localhost:3000/api/cv'


export default {
  async createCV(cvData: CV): Promise<CV> {
    const response = await axios.post<CV>(API_URL, cvData)
    return response.data
  },

  async getUserCVs(): Promise<CV[]> {
    const response = await axios.get<CV[]>(API_URL)
    return response.data
  },

  async getCVById(id: string): Promise<CV> {
    const response = await axios.get<CV>(`${API_URL}/${id}`)
    return response.data
  },

  async updateCV(id: string, cvData: CV): Promise<CV> {
    const response = await axios.put<CV>(`${API_URL}/${id}`, cvData)
    return response.data
  },

  async deleteCV(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`)
  },
}
