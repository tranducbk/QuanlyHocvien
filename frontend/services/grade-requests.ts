import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  GradeRequest,
  GradeRequestQueryRequest,
  ReviewGradeRequestRequest,
} from "@/types/student-academic";

export const gradeRequestService = {
  getStudentGradeRequests: async (params?: GradeRequestQueryRequest): Promise<PaginatedResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.STUDENT_BASE, { params });
  },

  getCommanderGradeRequests: async (params?: GradeRequestQueryRequest): Promise<PaginatedResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.COMMANDER_BASE, { params });
  },

  getGradeRequestDetail: async (id: string): Promise<ApiResponse<GradeRequest>> => {
    return apiClient.get(ENDPOINTS.GRADE_REQUESTS.COMMANDER_DETAIL(id));
  },

  rejectGradeRequest: async (id: string, data: ReviewGradeRequestRequest): Promise<ApiResponse<GradeRequest>> => {
    return apiClient.post(ENDPOINTS.GRADE_REQUESTS.REJECT(id), data);
  },
};
