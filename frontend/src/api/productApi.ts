import { axiosInstance } from './axiosInstance';
import { ApiResponse, Product } from '../types/api.types';
import { ProductListQuery, SearchQuery } from '../types/product.types';

export const productApi = {
  getAll: async (params?: ProductListQuery) => {
    // Axios will automatically strip out undefined params
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },
  search: async (params: SearchQuery) => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/products/search', { params });
    return response.data;
  },
  getSimilarProducts: async (productId: string) => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(`/products/${productId}/similar`);
    return response.data;
  },
};
