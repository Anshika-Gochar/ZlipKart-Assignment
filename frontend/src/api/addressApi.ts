import { axiosInstance } from './axiosInstance';
import { ApiResponse } from '../types/api.types';

export const addressApi = {
  getAddresses: async () => {
    const response = await axiosInstance.get<ApiResponse<any>>('/addresses');
    return response.data;
  },
  addAddress: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/addresses', data);
    return response.data;
  },
  updateAddress: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/addresses/${id}`, data);
    return response.data;
  },
  deleteAddress: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/addresses/${id}`);
    return response.data;
  }
};
