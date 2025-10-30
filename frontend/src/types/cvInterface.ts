export interface CV {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  template?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  generatedPdfUrl?: string;
  contentJson: any;
  createdAt: string;
  updatedAt: string;
}

export interface CVState {
  cvs: CV[];
  currentCV: CV | null;
  loading: boolean;
  error: string | null;
}