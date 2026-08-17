import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  AssignStudentsRequest,
  AssignStudentsBatchRequest,
  Class,
  ClassQueryRequest,
  CreateClassRequest,
  UpdateClassRequest,
} from "@/types/classes";
import { Student, StudentProfileQueryRequest } from "@/types/user";

export const classService = {
  getClasses: async (
    params?: ClassQueryRequest
  ): Promise<PaginatedResponse<Class>> => {
    return apiClient.get(ENDPOINTS.CLASSES.BASE, { params });
  },

  createClass: async (
    data: CreateClassRequest
  ) => {
    return apiClient.post(ENDPOINTS.CLASSES.BASE, data);
  },

  updateClass: async (
    id: string,
    data: UpdateClassRequest
  ) => {
    return apiClient.put(`${ENDPOINTS.CLASSES.BASE}/${id}`, data);
  },

  deleteClass: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.CLASSES.BASE}/${id}`);
  },

  getClassStudents: async (
    id: string,
    params?: StudentProfileQueryRequest
  ): Promise<PaginatedResponse<Student>> => {
    return apiClient.get(ENDPOINTS.CLASSES.STUDENTS(id), { params });
  },

  assignStudentsBatch: async (
    id: string,
    data: AssignStudentsBatchRequest
  ): Promise<ApiResponse<BatchMutationResult>> => {
    return apiClient.post(ENDPOINTS.CLASSES.ASSIGN_STUDENTS_BATCH(id), data);
  },

  assignStudents: async (
    id: string,
    data: AssignStudentsRequest
  ): Promise<ApiResponse<BatchMutationResult>> => {
    return apiClient.post(ENDPOINTS.CLASSES.STUDENTS(id), data);
  },

  removeStudent: async (id: string, userId: string) => {
    return apiClient.delete(ENDPOINTS.CLASSES.STUDENT_DETAIL(id, userId));
  },
};
