import { apiGet, apiPut } from './api';

export interface ProgressData {
  totalStudyTime?: number;
  streak?: { current: number; longest: number };
  goals?: any[];
}

export const ProgressService = {
  get: async (): Promise<ProgressData> => {
    const res = await apiGet<ProgressData>('/progress');
    return (res.data as any) || {};
  },
  update: async (data: Partial<ProgressData>): Promise<ProgressData> => {
    const res = await apiPut<ProgressData>('/progress', data);
    return (res.data as any) || {};
  },
};

export default ProgressService;

