// stores/ui.ts
import { defineStore } from 'pinia'

export type Section =
  | 'dashboard'
  | 'create-cv'
  | 'my-cvs'
  | 'ai-review'
  | 'job-match'
  | 'career-copilot'
  | 'templates'
  | 'settings'

export const useUIStore = defineStore('ui', {
  state: () => ({
    activeSection: 'dashboard' as Section
  }),
  actions: {
    setActiveSection(section: Section) {
      this.activeSection = section
    }
  }
})
