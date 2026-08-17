import { ENDPOINTS } from "@/constants/endpoints";
import {
  Achievement,
  AchievementQueryRequest,
  CreateAchievementRequest,
  MyAchievementsResponse,
  UpdateAchievementRequest,
} from "@/types/achievements";
import apiClient from "./axios-client";

export const achievementService = {
  getAchievements: async (
    params?: AchievementQueryRequest
  ): Promise<PaginatedResponse<Achievement>> => {
    return apiClient.get(ENDPOINTS.ACHIEVEMENTS.BASE, { params });
  },

  createAchievement: async (data: CreateAchievementRequest) => {
    return apiClient.post(ENDPOINTS.ACHIEVEMENTS.BASE, data);
  },

  importAchievements: async (
    file: File
  ): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(ENDPOINTS.ACHIEVEMENTS.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.ACHIEVEMENTS.TEMPLATE, {
      responseType: "blob",
    });
  },

  exportAchievements: async (
    params?: AchievementQueryRequest
  ): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.ACHIEVEMENTS.EXPORT, {
      params,
      responseType: "blob",
    });
  },

  updateAchievement: async (id: string, data: UpdateAchievementRequest) => {
    return apiClient.put(`${ENDPOINTS.ACHIEVEMENTS.BASE}/${id}`, data);
  },

  deleteAchievement: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.ACHIEVEMENTS.BASE}/${id}`);
  },

  getMyAchievements: async (): Promise<ApiResponse<MyAchievementsResponse>> => {
    return apiClient.get(ENDPOINTS.ACHIEVEMENTS.MY);
  },
};
