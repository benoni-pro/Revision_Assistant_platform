import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Rubric {
  _id?: string;
  title: string;
  genre: 'argumentative' | 'narrative' | 'informative' | 'other';
  subject?: string;
  standards?: string[];
  criteria: Array<{ name: string; description?: string; levels: Array<{ label: string; description?: string; score: number }> }>;
  isPublic?: boolean;
}

export const rubricService = {
  list: async (genre?: string): Promise<Rubric[]> => {
    const q = genre ? `?genre=${encodeURIComponent(genre)}` : '';
    const res = await apiGet(`/rubrics${q}`);
    return (res.data as any).docs || [];
  },
  create: async (payload: Rubric): Promise<Rubric> => {
    const res = await apiPost('/rubrics', payload);
    return res.data as any;
  },
  update: async (id: string, payload: Rubric): Promise<Rubric> => {
    const res = await apiPut(`/rubrics/${id}`, payload);
    return res.data as any;
  },
  remove: async (id: string): Promise<void> => {
    await apiDelete(`/rubrics/${id}`);
  }
};

export default rubricService;

