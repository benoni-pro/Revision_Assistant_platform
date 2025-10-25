import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { PaginatedResponse } from '../types';

export interface ResourceListItem {
  _id: string;
  title: string;
  description?: string;
  type: 'book' | 'video' | 'article' | 'document' | 'link' | 'course' | 'tutorial' | 'other';
  subject: string;
  category: string;
  level: string;
  author?: string;
  thumbnailUrl?: string;
  averageRating: number;
  totalRatings: number;
  views: number;
  downloads: number;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface ResourceDetail extends ResourceListItem {
  publisher?: string;
  publishedDate?: string;
  url?: string;
  fileUrl?: string;
  tags: string[];
  ratings: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    rating: number;
    review?: string;
    createdAt: string;
  }>;
  metadata?: {
    pages?: number;
    duration?: number;
    format?: string;
    size?: number;
    language?: string;
  };
}

export interface CreateResourceDto {
  title: string;
  description?: string;
  type: string;
  subject: string;
  category?: string;
  level?: string;
  author?: string;
  publisher?: string;
  url?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ResourceFilters {
  search?: string;
  subject?: string;
  type?: string;
  level?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const ResourceService = {
  list: async (filters: ResourceFilters = {}): Promise<PaginatedResponse<ResourceListItem>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const res = await apiGet<PaginatedResponse<ResourceListItem>>(`/resources?${params.toString()}`);
    return res.data || { docs: [], total: 0, page: 1, pages: 0 };
  },

  get: async (id: string): Promise<ResourceDetail> => {
    const res = await apiGet<ResourceDetail>(`/resources/${id}`);
    return res.data as ResourceDetail;
  },

  create: async (payload: CreateResourceDto): Promise<ResourceDetail> => {
    const res = await apiPost<ResourceDetail>('/resources', payload);
    return res.data as ResourceDetail;
  },

  update: async (id: string, payload: Partial<CreateResourceDto>): Promise<ResourceDetail> => {
    const res = await apiPut<ResourceDetail>(`/resources/${id}`, payload);
    return res.data as ResourceDetail;
  },

  delete: async (id: string): Promise<void> => {
    await apiDelete(`/resources/${id}`);
  },

  addRating: async (id: string, rating: number, review?: string): Promise<ResourceDetail> => {
    const res = await apiPost<ResourceDetail>(`/resources/${id}/ratings`, { rating, review });
    return res.data as ResourceDetail;
  },

  toggleBookmark: async (id: string): Promise<{ isBookmarked: boolean }> => {
    const res = await apiPost<{ isBookmarked: boolean }>(`/resources/${id}/bookmark`, {});
    return res.data as { isBookmarked: boolean };
  },

  recordDownload: async (id: string): Promise<void> => {
    await apiPost(`/resources/${id}/download`, {});
  }
};

export default ResourceService;
