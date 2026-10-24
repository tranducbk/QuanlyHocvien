import apiClient from "@/services/axios-client";
import { ENDPOINTS } from "@/constants/endpoints";

export type ClassStudent = { id: string; code: string; fullName: string };
export type ClassAchievement = {
  id: string; studentUserId: string; student: { code: string; fullName: string; unit?: string };
  category: "AWARD" | "SCIENTIFIC_TOPIC" | "SCIENTIFIC_INITIATIVE";
  title: string; award: string | null; year: number | null; description: string | null;
  schoolYear: string | null; semester: string | null; content: string | null; updatedAt: string;
};
export type ClassDuty = {
  id: string; studentUserId: string; student: { code: string; fullName: string };
  position: string; workDay: string;
};
export type AchievementInput = Pick<ClassAchievement, "category" | "title" | "award" | "year" | "description" | "schoolYear" | "semester" | "content">;
export type DutyInput = Pick<ClassDuty, "position" | "workDay">;

export const trainingClassRecordsService = {
  getAchievements: (classId: string): Promise<ApiResponse<ClassAchievement[]>> =>
    apiClient.get<unknown, ApiResponse<ClassAchievement[]>>(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENTS(classId)),
  createAchievement: (classId: string, data: AchievementInput & { studentUserId: string }): Promise<ApiResponse<ClassAchievement>> =>
    apiClient.post<unknown, ApiResponse<ClassAchievement>>(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENTS(classId), data),
  updateAchievement: (classId: string, recordId: string, data: AchievementInput): Promise<ApiResponse<ClassAchievement>> =>
    apiClient.put<unknown, ApiResponse<ClassAchievement>>(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENT(classId, recordId), data),
  deleteAchievement: (classId: string, recordId: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    apiClient.delete<unknown, ApiResponse<{ deleted: boolean }>>(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENT(classId, recordId)),
  downloadAchievementTemplate: (classId: string): Promise<Blob> =>
    apiClient.get(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENT_TEMPLATE(classId), { responseType: "blob" }),
  exportAchievements: (classId: string, params?: Record<string, unknown>): Promise<Blob> =>
    apiClient.get(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENT_EXPORT(classId), { params, responseType: "blob" }),
  importAchievements: (classId: string, file: File): Promise<ApiResponse<{ created: number }>> => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.post(ENDPOINTS.TRAINING_CLASSES.ACHIEVEMENT_IMPORT(classId), body, { headers: { "Content-Type": "multipart/form-data" } });
  },
  getDuties: (classId: string): Promise<ApiResponse<ClassDuty[]>> =>
    apiClient.get<unknown, ApiResponse<ClassDuty[]>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULES(classId)),
  createDuty: (classId: string, data: DutyInput & { studentUserId: string }): Promise<ApiResponse<ClassDuty>> =>
    apiClient.post<unknown, ApiResponse<ClassDuty>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULES(classId), data),
  updateDuty: (classId: string, recordId: string, data: DutyInput): Promise<ApiResponse<ClassDuty>> =>
    apiClient.put<unknown, ApiResponse<ClassDuty>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULE(classId, recordId), data),
  deleteDuty: (classId: string, recordId: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    apiClient.delete<unknown, ApiResponse<{ deleted: boolean }>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULE(classId, recordId)),
};
