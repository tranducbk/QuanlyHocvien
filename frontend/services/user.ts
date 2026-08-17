import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  UserQueryRequest,
  UserDetailResponse,
  UpdateProfileRequest,
  Student,
  StudentProfileQueryRequest,
} from "@/types/user";

export const userService = {
  getAllUsers: async (
    params: UserQueryRequest
  ): Promise<PaginatedResponse<UserDetailResponse>> => {
    return apiClient.get(ENDPOINTS.USERS.BASE, { params });
  },

  getUserById: async (
    id: string | number
  ): Promise<ApiResponse<UserDetailResponse>> => {
    return apiClient.get(ENDPOINTS.USERS.DETAIL(id));
  },

  updateUser: async (id: string | number, data: UpdateProfileRequest) => {
    return apiClient.put(ENDPOINTS.USERS.DETAIL(id), data);
  },

  getStudentProfiles: async (
    params: StudentProfileQueryRequest
  ): Promise<PaginatedResponse<Student>> => {
    return apiClient.get(ENDPOINTS.USERS.PROFILES, { params });
  },

  getStudentProfileById: async (
    id: string | number
  ): Promise<ApiResponse<Student>> => {
    return apiClient.get(ENDPOINTS.USERS.PROFILE_DETAIL(id));
  },

  updateStudentProfile: async (
    id: string | number,
    data: UpdateProfileRequest
  ): Promise<ApiResponse<Student>> => {
    return apiClient.put(ENDPOINTS.USERS.PROFILE_DETAIL(id), data);
  },

  toggleActive: async (id: string | number) => {
    return apiClient.post(ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
  },

  resetPassword: async (id: string | number, newPassword?: string) => {
    return apiClient.post(ENDPOINTS.USERS.RESET_PASSWORD(id), { newPassword });
  },

  deleteUser: async (id: string | number) => {
    return apiClient.delete(ENDPOINTS.USERS.DETAIL(id));
  },

  exportUsers: async (params?: UserQueryRequest): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.USERS.EXPORT, {
      params,
      responseType: "blob",
    });
  },

  importUsers: async (
    file: File
  ): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(ENDPOINTS.USERS.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.USERS.IMPORT_TEMPLATE, {
      responseType: "blob",
    });
  },

  importBatchStudents: async (
    file: File
  ): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.put(ENDPOINTS.USERS.BATCH_PROFILES, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadBatchStudentsTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.USERS.BATCH_PROFILES_TEMPLATE, {
      responseType: "blob",
    });
  },
};
