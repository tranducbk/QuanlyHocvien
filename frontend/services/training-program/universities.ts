import apiClient from "../axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  University,
  UniversityQueryRequest,
  CreateUniversityRequest,
  UpdateUniversityRequest,
  UniversityStudent,
  UniversityStudentQuery,
} from "@/types/training-program/universities";

export const universityService = {
  getAvailableStudents: (id: string, params: UniversityStudentQuery): Promise<PaginatedResponse<UniversityStudent>> =>
    apiClient.get(ENDPOINTS.UNIVERSITIES.AVAILABLE_STUDENTS(id), { params }),
  addStudents: (id: string, profileIds: string[]): Promise<ApiResponse<{ added: number }>> =>
    apiClient.post(ENDPOINTS.UNIVERSITIES.STUDENTS(id), { profileIds }),
  getUniversities: async (
    params?: UniversityQueryRequest
  ): Promise<PaginatedResponse<University>> => {
    return apiClient.get(ENDPOINTS.UNIVERSITIES.BASE, { params });
  },

  getUniversity: async (
    id: string
  ): Promise<ApiResponse<University>> => {
    return apiClient.get(`${ENDPOINTS.UNIVERSITIES.BASE}/${id}`);
  },

  createUniversity: async (
    data: CreateUniversityRequest
  ) => {
    return apiClient.post(ENDPOINTS.UNIVERSITIES.BASE, data);
  },

  updateUniversity: async (
    id: string,
    data: UpdateUniversityRequest
  ) => {
    return apiClient.put(
      `${ENDPOINTS.UNIVERSITIES.BASE}/${id}`,
      data
    );
  },

  toggleUniversityStatus: async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE"
  ): Promise<ApiResponse<University>> => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    return apiClient.put(`${ENDPOINTS.UNIVERSITIES.BASE}/${id}`, {
      status: newStatus,
    });
  },

  deleteUniversity: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.UNIVERSITIES.BASE}/${id}`);
  },
};
