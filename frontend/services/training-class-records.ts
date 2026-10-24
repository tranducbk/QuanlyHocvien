import apiClient from "@/services/axios-client";
import { ENDPOINTS } from "@/constants/endpoints";

export type ClassStudent = { id: string; code: string; fullName: string };
export type ClassAchievement = {
  id: string; studentUserId: string; student: { code: string; fullName: string };
  category: "AWARD" | "SCIENTIFIC_TOPIC" | "SCIENTIFIC_INITIATIVE";
  title: string; award: string | null; year: number | null; description: string | null;
};
export type ClassDuty = {
  id: string; studentUserId: string; student: { code: string; fullName: string };
  position: string; workDay: string;
};
export type AchievementInput = Pick<ClassAchievement, "category" | "title" | "award" | "year" | "description">;
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
  getDuties: (classId: string): Promise<ApiResponse<ClassDuty[]>> =>
    apiClient.get<unknown, ApiResponse<ClassDuty[]>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULES(classId)),
  createDuty: (classId: string, data: DutyInput & { studentUserId: string }): Promise<ApiResponse<ClassDuty>> =>
    apiClient.post<unknown, ApiResponse<ClassDuty>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULES(classId), data),
  updateDuty: (classId: string, recordId: string, data: DutyInput): Promise<ApiResponse<ClassDuty>> =>
    apiClient.put<unknown, ApiResponse<ClassDuty>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULE(classId, recordId), data),
  deleteDuty: (classId: string, recordId: string): Promise<ApiResponse<{ deleted: boolean }>> =>
    apiClient.delete<unknown, ApiResponse<{ deleted: boolean }>>(ENDPOINTS.TRAINING_CLASSES.DUTY_SCHEDULE(classId, recordId)),
};
