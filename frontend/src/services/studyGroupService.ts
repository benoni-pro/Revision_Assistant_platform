import { apiGet, apiPost } from './api';
import { PaginatedResponse } from '../types';

export interface StudyGroupListItem {
  _id: string;
  name: string;
  subject: string;
  level: string;
  memberCount: number;
}

export interface CreateStudyGroupDto {
  name: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
}

export const StudyGroupService = {
  list: async (): Promise<StudyGroupListItem[]> => {
    const res = await apiGet<PaginatedResponse<StudyGroupListItem>>('/study-groups');
    return res.data?.docs || [];
  },

  create: async (payload: CreateStudyGroupDto): Promise<StudyGroupListItem> => {
    const res = await apiPost<StudyGroupListItem>('/study-groups', payload);
    return (res.data as any) || ({} as StudyGroupListItem);
  },
};

export default StudyGroupService;

