import { apiGet } from './api';

export interface BalancingStudiesParams {
  path?: string;
  [key: string]: any;
}

export const fetchBalancingStudies = async (params?: BalancingStudiesParams): Promise<any> => {
  const query = new URLSearchParams((params || {}) as Record<string, string>);
  const q = query.toString();
  const url = `/resources/balancing-studies${q ? `?${q}` : ''}`;
  const resp = await apiGet<any>(url);
  return resp.data;
};

export default {
  fetchBalancingStudies,
};