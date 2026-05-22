import { axiosInstance } from './axiosInstance';
import { ApiResponse } from '../types/api.types';

export const ordersApi = {
  // Fetch list of orders
  listOrders: async () => {
    const response = await axiosInstance.get<ApiResponse<any>>('/orders');
    return response.data;
  },
  // Fetch details for a single order
  getOrderDetail: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any>>(`/orders/${id}`);
    return response.data;
  },
  // Create a new order (optional, kept for completeness)
  createOrder: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/orders', data);
    return response.data;
  }
};
