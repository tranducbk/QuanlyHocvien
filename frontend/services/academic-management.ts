import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import { SemesterResult, SubjectResult } from "@/types/student-academic";

export interface SemesterResultQueryRequest extends QueryRequest {
  semester?: string;
  schoolYear?: string;
  userId?: string;
  fullName?: string;
  unit?: string;
  gpaFrom?: number;
  gpaTo?: number;
  cpaFrom?: number;
  cpaTo?: number;
  latestOnly?: boolean;
  excludeId?: string;
}

export const academicManagementService = {
  // Semester Results
  getSemesterResults: async (
    params?: SemesterResultQueryRequest
  ): Promise<PaginatedResponse<SemesterResult>> => {
    return apiClient.get(ENDPOINTS.SEMESTER_RESULTS.BASE, { params });
  },

  getSemesterResultDetail: async (id: string): Promise<ApiResponse<SemesterResult>> => {
    return apiClient.get(ENDPOINTS.SEMESTER_RESULTS.DETAIL(id));
  },

  createSemesterResult: async (data: Partial<SemesterResult>): Promise<ApiResponse<SemesterResult>> => {
    return apiClient.post(ENDPOINTS.SEMESTER_RESULTS.BASE, data);
  },

  updateSemesterResult: async (id: string, data: Partial<SemesterResult>): Promise<ApiResponse<SemesterResult>> => {
    return apiClient.put(ENDPOINTS.SEMESTER_RESULTS.DETAIL(id), data);
  },

  deleteSemesterResult: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(ENDPOINTS.SEMESTER_RESULTS.DETAIL(id));
  },

  // Subject Results
  createSubjectResult: async (data: Partial<SubjectResult>): Promise<ApiResponse<SubjectResult>> => {
    return apiClient.post(ENDPOINTS.SUBJECT_RESULTS.BASE, data);
  },

  updateSubjectResult: async (id: string, data: Partial<SubjectResult>): Promise<ApiResponse<SubjectResult>> => {
    return apiClient.put(ENDPOINTS.SUBJECT_RESULTS.DETAIL(id), data);
  },

  deleteSubjectResult: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(ENDPOINTS.SUBJECT_RESULTS.DETAIL(id));
  },

  importSubjectResults: async (semesterResultId: string, file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("semesterResultId", semesterResultId);
    return apiClient.post(`${ENDPOINTS.SUBJECT_RESULTS.BASE}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  downloadSubjectResultTemplate: async (): Promise<Blob> => {
    return apiClient.get(`${ENDPOINTS.SUBJECT_RESULTS.BASE}/template/download`, {
      responseType: 'blob',
    });
  },
};
