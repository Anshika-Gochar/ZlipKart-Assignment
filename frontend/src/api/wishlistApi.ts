import { axiosInstance } from './axiosInstance';
import { ApiResponse } from '../types/api.types';

export const wishlistApi = {
  // GET /wishlist — fetch current user's wishlist
  getWishlist: async () => {
    const response = await axiosInstance.get<ApiResponse<any>>('/wishlist');
    return response.data;
  },

  // POST /wishlist/:productId — add a product to wishlist
  addItem: async (productId: string) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/wishlist/${productId}`);
    return response.data;
  },

  // DELETE /wishlist/:productId — remove a product from wishlist
  removeItem: async (productId: string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/wishlist/${productId}`);
    return response.data;
  },
};
