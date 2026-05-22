import { axiosInstance } from './axiosInstance';
import { ApiResponse, Category } from '../types/api.types';

export const categoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`/categories/${slug}`);
    return response.data;
  }
};
