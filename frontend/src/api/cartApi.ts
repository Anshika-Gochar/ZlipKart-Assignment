import { axiosInstance } from './axiosInstance';
import { ApiResponse, Cart } from '../types/api.types';

export const cartApi = {
  getCart: async () => {
    const response = await axiosInstance.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },
  addItem: async (data: { productId: string; quantity: number }) => {
    const response = await axiosInstance.post<ApiResponse<Cart>>('/cart/items', data);
    return response.data;
  },
  updateItem: async (itemId: string, quantity: number) => {
    const response = await axiosInstance.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  removeItem: async (itemId: string) => {
    const response = await axiosInstance.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await axiosInstance.delete<ApiResponse<null>>('/cart');
    return response.data;
  }
};
