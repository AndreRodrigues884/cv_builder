export interface CV {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  template?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  generatedPdfUrl?: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}