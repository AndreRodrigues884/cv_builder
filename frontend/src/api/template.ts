import api from '../services/axios'
import { TemplateListResponse } from '../types/templateInterface'

const BASE_URL = '/templates'

export const getAllTemplates = () =>
  api.get<TemplateListResponse>(BASE_URL)