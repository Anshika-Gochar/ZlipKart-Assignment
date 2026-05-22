/**
 * src/api/aiApi.ts
 *
 * API client for the AI shopping assistant.
 * Calls POST /ai/recommend — public endpoint, no auth needed.
 */

import { axiosInstance } from './axiosInstance';
import type { ApiResponse, Product } from '../types/api.types';

export interface AIRecommendResponse {
  message: string;
  products: Product[];
}

export const aiApi = {
  recommend: async (query: string): Promise<AIRecommendResponse> => {
    const response = await axiosInstance.post<ApiResponse<AIRecommendResponse>>(
      '/ai/recommend',
      { query }
    );
    // response.data is the ApiResponse envelope — unwrap .data
    return response.data.data;
  },
};
