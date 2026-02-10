export interface Glossary {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entry {
  id: number;
  glossaryId: number;
  term: string;
  definition: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
