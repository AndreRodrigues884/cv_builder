// frontend/src/services/aiService.ts
import axios from 'axios'
import type { CV } from '../types/cvInterface'

const API_URL = `${import.meta.env.VITE_API_URL}/api/ai`

export default {
  async improveDescription(description: string, position: string, company: string): Promise<string> {
    const response = await axios.post<{ improved: string }>(`${API_URL}/improve-description`, {
      description,
      position,
      company,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data.improved
  },

  async suggestSkills(targetPosition: string, experiences: string[]): Promise<string[]> {
    const response = await axios.post<{ skills: string[] }>(`${API_URL}/suggest-skills`, {
      targetPosition,
      experiences,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data.skills
  },

  async generateSummary(fullName: string, targetPosition: string, experiences: string[], skills: string[]): Promise<string> {
    const response = await axios.post<{ summary: string }>(`${API_URL}/generate-summary`, {
      fullName,
      targetPosition,
      experiences,
      skills,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data.summary
  },

  async optimizeForATS(cvData: CV): Promise<CV> {
    const response = await axios.post<CV>(`${API_URL}/optimize-ats`, cvData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data
  },
}
