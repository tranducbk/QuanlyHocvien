import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import { MilitaryScheduleItem, MilitarySemester, MilitarySubject, MilitaryTimeTable } from "@/types/military-academic";

export const militaryAcademicService = {
  getSemesters: (): Promise<PaginatedResponse<MilitarySemester>> => apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.SEMESTERS, { params: { limit: 100 } }),
  createSemester: (data: Pick<MilitarySemester, "code" | "schoolYear">): Promise<ApiResponse<MilitarySemester>> => apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.SEMESTERS, data),
  getSubjects: (classId: string): Promise<PaginatedResponse<MilitarySubject>> => apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.SUBJECTS(classId), { params: { limit: 100 } }),
  createSubject: (classId: string, data: Omit<MilitarySubject, "id" | "classId">): Promise<ApiResponse<MilitarySubject>> => apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.SUBJECTS(classId), data),
  getTimeTable: (classId: string, semesterId: string): Promise<ApiResponse<MilitaryTimeTable | null>> => apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.TIME_TABLE(classId), { params: { semesterId } }),
  saveTimeTable: (classId: string, semesterId: string, schedules: MilitaryScheduleItem[]): Promise<ApiResponse<MilitaryTimeTable>> => apiClient.put(ENDPOINTS.MILITARY_ACADEMIC.TIME_TABLE(classId), { semesterId, schedules }),
  getMyTimeTable: (): Promise<ApiResponse<MilitaryTimeTable[]>> => apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.MY_TIME_TABLE),
};
