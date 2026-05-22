import { axiosInstance } from './axiosInstance';
import { ApiResponse, AuthResponse } from '../types/api.types';
import { LoginData, RegisterPayload } from '../schemas/auth.schemas';

export const authApi = {
  login: async (data: LoginData) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterPayload) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get<ApiResponse<AuthResponse['user']>>('/auth/me');
    return response.data;
  }
};

