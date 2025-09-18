import { apiGet, apiPost } from './api';
import { PaginatedResponse } from '../types';

export interface QuizListItem {
  _id: string;
  title: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
}

export interface CreateQuizDto {
  title: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
}

export const QuizService = {
  list: async (): Promise<QuizListItem[]> => {
    const res = await apiGet<PaginatedResponse<QuizListItem>>('/quizzes');
    return res.data?.docs || [];
  },

  create: async (payload: CreateQuizDto): Promise<QuizListItem> => {
    const res = await apiPost<QuizListItem>('/quizzes', payload);
    return (res.data as any) || ({} as QuizListItem);
  },
};

export default QuizService;

