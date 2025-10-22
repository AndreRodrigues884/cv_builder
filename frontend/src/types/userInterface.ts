import { Certification, Education, Experience, Project, Skill } from "./profileInterface";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Billing {
  plan: string;
  subscriptionStatus?: string;
  cvGenerationLimit?: number;
  cvGenerationCount: number;
}

export interface Profile {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  location: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  languages?: string[];
  visibility: "PUBLIC" | "PRIVATE";
  publicSlug?: string;
  profileImageUrl?: string | null;

  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  projects?: Project[];

  createdAt: string;
  updatedAt: string;
}
