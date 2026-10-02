import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  MilitaryClass,
  MilitaryClassRequest,
  MilitaryStudentProfile,
} from "@/types/military-classes";

export const militaryClassService = {
  getAll: (): Promise<PaginatedResponse<MilitaryClass>> =>
    apiClient.get(ENDPOINTS.MILITARY_CLASSES.BASE, { params: { limit: 100 } }),
  getMilitaryCommanders: (): Promise<
    ApiResponse<Array<{ id: string; username: string }>>
  > => apiClient.get(ENDPOINTS.MILITARY_CLASSES.COMMANDERS),
  create: (data: MilitaryClassRequest): Promise<ApiResponse<MilitaryClass>> =>
    apiClient.post(ENDPOINTS.MILITARY_CLASSES.BASE, data),
  update: (
    id: string,
    data: MilitaryClassRequest
  ): Promise<ApiResponse<MilitaryClass>> =>
    apiClient.put(ENDPOINTS.MILITARY_CLASSES.DETAIL(id), data),
  delete: (id: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_CLASSES.DETAIL(id)),
  getStudents: (
    id: string
  ): Promise<PaginatedResponse<MilitaryStudentProfile>> =>
    apiClient.get(ENDPOINTS.MILITARY_CLASSES.STUDENTS(id), {
      params: { limit: 100 },
    }),
  assignStudentsByCode: (id: string, studentCodes: string[]) =>
    apiClient.post(ENDPOINTS.MILITARY_CLASSES.ASSIGN_STUDENTS_BY_CODE(id), {
      studentCodes,
    }),
  removeStudent: (id: string, userId: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_CLASSES.STUDENT_DETAIL(id, userId)),
};
