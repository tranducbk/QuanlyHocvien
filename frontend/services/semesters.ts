import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  CreateSchoolYearRequest,
  CreateSemesterRequest,
  CreateTermRequest,
  SchoolYear,
  Semester,
  SemesterQueryRequest,
  UpdateSemesterRequest,
} from "@/types/semesters";

export const semesterService = {
  getSemesters: async (
    params?: SemesterQueryRequest
  ): Promise<PaginatedResponse<Semester>> => {
    return apiClient.get(ENDPOINTS.SEMESTERS.BASE, { params });
  },

  getSemester: async (id: string): Promise<Semester> => {
    return apiClient.get(`${ENDPOINTS.SEMESTERS.BASE}/${id}`);
  },

  getSchoolYears: async (
    params?: QueryRequest & { schoolYear?: string }
  ): Promise<PaginatedResponse<SchoolYear>> => {
    return apiClient.get(ENDPOINTS.SEMESTERS.SCHOOL_YEARS, { params });
  },

  createSemester: async (data: CreateSemesterRequest) => {
    return apiClient.post(ENDPOINTS.SEMESTERS.BASE, data);
  },

  createSchoolYear: async (data: CreateSchoolYearRequest) => {
    return apiClient.post(ENDPOINTS.SEMESTERS.SCHOOL_YEARS, data);
  },

  createTerm: async (data: CreateTermRequest) => {
    return apiClient.post(ENDPOINTS.SEMESTERS.TERMS, data);
  },

  updateSemester: async (id: string, data: UpdateSemesterRequest) => {
    return apiClient.put(`${ENDPOINTS.SEMESTERS.BASE}/${id}`, data);
  },

  deleteSemester: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.SEMESTERS.BASE}/${id}`);
  },
};
