import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  CreateGradeRequestRequest,
  GradeRequest,
  GradeRequestQueryRequest,
  ReviewGradeRequestRequest,
} from "@/types/student-academic";

export const gradeRequestService = {
  getStudentGradeRequests: async (params?: GradeRequestQueryRequest): Promise<PaginatedResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.STUDENT_BASE, { params });
  },

  uploadEvidence: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`${ENDPOINTS.GRADE_REQUESTS.STUDENT_BASE}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  createGradeRequest: async (data: CreateGradeRequestRequest) => {
    return apiClient.post<ApiResponse<GradeRequest>>(ENDPOINTS.GRADE_REQUESTS.STUDENT_BASE, data);
  },

  getCommanderGradeRequests: async (params?: GradeRequestQueryRequest): Promise<PaginatedResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.COMMANDER_BASE, { params });
  },

  getGradeRequestDetail: async (id: string): Promise<ApiResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.COMMANDER_DETAIL(id));
  },

  approveGradeRequest: async (id: string, data: ReviewGradeRequestRequest): Promise<ApiResponse<GradeRequest>> => {
    return apiClient.post(ENDPOINTS.GRADE_REQUESTS.APPROVE(id), data);
  },

  rejectGradeRequest: async (id: string, data: ReviewGradeRequestRequest): Promise<ApiResponse<GradeRequest>> => {
    return apiClient.post(ENDPOINTS.GRADE_REQUESTS.REJECT(id), data);
  },
};
