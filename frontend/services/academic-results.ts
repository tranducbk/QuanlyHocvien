import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  AcademicResultQueryRequest,
  YearlyResult,
} from "@/types/student-academic";

const toPaginatedResponse = <T>(items: T[]): PaginatedResponse<T> => ({
  statusCode: 200,
  message: "Thành công",
  data: items,
  pagination: {
    total: items.length,
    page: 1,
    limit: Math.max(items.length, 1),
    totalPages: 1,
  },
});

export const academicResultService = {
  getAcademicResults: async (params?: AcademicResultQueryRequest): Promise<PaginatedResponse<YearlyResult>> => {
    const response = await apiClient.get<ApiResponse<YearlyResult[]>, ApiResponse<YearlyResult[]>>(
      ENDPOINTS.ACADEMIC_RESULTS.BASE,
      { params }
    );

    return toPaginatedResponse(response.data || []);
  },
};
