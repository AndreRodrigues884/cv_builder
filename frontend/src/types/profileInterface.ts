export interface Experience {
  id: string;
  profileId: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  skills: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Formação académica
export interface Education {
  id: string;
  profileId: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  achievements: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Competências
export interface Skill {
  id: string;
  profileId: string;
  name: string;
  category?: string; // ex: Backend, Frontend
  level: number;     // 1-5
  yearsOfExp?: number;
  isEndorsed?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Certificações
export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingOrg?: string;
  issueDate: string;
  expirationDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  doesNotExpire: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Projetos
export interface Project {
  id: string;
  profileId: string;
  name: string;
  description?: string;
  role?: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  url?: string;
  technologies: string[];
  highlights: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}