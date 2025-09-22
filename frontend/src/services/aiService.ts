import { apiGet, apiPost } from './api';

export const aiService = {
  models: async () => {
    const res = await apiGet('/ai/models');
    return res.data as any;
  },
  analysis: async () => {
    const res = await apiGet('/ai/analysis');
    return res.data as any;
  },
  feedback: async (text: string, provider?: 'ollama' | 'openai', model?: string) => {
    const res = await apiPost('/ai/feedback', { text, provider, model });
    return res.data as any;
  },
  outline: async (topic: string) => {
    const res = await apiPost('/ai/outline', { topic });
    return res.data as any;
  },
  prompts: async (genre: string) => {
    const res = await apiGet(`/ai/prompts?genre=${encodeURIComponent(genre)}`);
    return res.data as any;
  },
  teacherOverview: async () => {
    const res = await apiGet('/ai/teacher-overview');
    return res.data as any;
  }
};

export default aiService;

