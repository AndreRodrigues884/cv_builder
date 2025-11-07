
export interface TemplateState {
  templates: Template[]
  categorized: CategorizedTemplates | null
  loading: boolean
  error: string | null
}

export interface TemplateCount {
  cvs: number
}

export interface Template {
  id: string
  name: string
  slug: string
  type: string
  description: string
  previewImageUrl: string
  isPremium: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  _count: TemplateCount
}

export interface CategorizedTemplates {
  free: Template[]
  premium: Template[]
  byType: Record<string, Template[]>
}

export interface TemplateListResponse {
  success: boolean
  data: {
    templates: Template[]
    categorized: CategorizedTemplates
    total: number
    free: number
    premium: number
  }
}