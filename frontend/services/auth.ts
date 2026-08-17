import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  LoginResponse,
  LoginRequest,
  ChangePasswordRequest,
  CreateUserRequest,
} from "@/types/auth";
import { UserDetailResponse, UpdateProfileRequest } from "@/types/user";

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  },

  getProfile: async (): Promise<ApiResponse<UserDetailResponse>> => {
    return apiClient.get(ENDPOINTS.AUTH.PROFILE);
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    return apiClient.put(ENDPOINTS.AUTH.PROFILE, data);
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post(ENDPOINTS.AUTH.AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  register: async (data: CreateUserRequest) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },
};
