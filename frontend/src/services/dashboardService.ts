import { apiGet } from './api';

export interface DashboardStats {
  todayStudyTime: number;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  completedQuizzes: number;
  averageScore: number;
  studyGroups: number;
  achievements: number;
  recentActivity: Array<{
    id: string;
    type: 'quiz' | 'study' | 'group' | 'achievement';
    title: string;
    score?: number;
    duration?: number;
    time: string;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiGet<DashboardStats>('/progress/stats');
    return res.data as DashboardStats;
  },

  getInsights: async (): Promise<{ insights: any[] }> => {
    const res = await apiGet<{ insights: any[] }>('/progress/insights');
    return res.data as { insights: any[] };
  },

  getAnalytics: async (): Promise<any> => {
    const res = await apiGet('/progress/analytics');
    return res.data;
  }
};

export default DashboardService;
