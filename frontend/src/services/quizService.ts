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

export interface QuizDetail {
  _id: string;
  title: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  settings?: any;
  totalQuestions: number;
  questions: Array<{
    _id: string;
    type: string;
    question: string;
    options?: Array<{ text: string }>;
    points: number;
  }>;
}

export interface AttemptResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  results: Array<{ questionId: string; isCorrect: boolean; earnedPoints: number; maxPoints: number }>
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

  get: async (id: string): Promise<QuizDetail> => {
    const res = await apiGet<QuizDetail>(`/quizzes/${id}`);
    return (res.data as any) as QuizDetail;
  },

  submitAttempt: async (id: string, answers: any, timeSpentSeconds: number): Promise<AttemptResult> => {
    const res = await apiPost<AttemptResult>(`/quizzes/${id}/attempts`, { answers, timeSpent: timeSpentSeconds });
    return (res.data as any) as AttemptResult;
  }
};

export default QuizService;

