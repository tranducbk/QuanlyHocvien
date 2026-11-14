import apiClient from "../axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CreateTrainingClass, TrainingClass, UpdateTrainingClass } from "@/types/training-program/training-classes";

export type TrainingClassLesson = { subjectId: string; day: number; startTime: string; endTime: string; room?: string | null; week?: number[] };

export const trainingClassService = {
  getMine: (): Promise<ApiResponse<TrainingClass[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingClass[]>>(ENDPOINTS.TRAINING_CLASSES.MINE),
  getStudents: (id: string): Promise<ApiResponse<{ id: string; userId: string; code: string; fullName: string }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; userId: string; code: string; fullName: string }[]>>(ENDPOINTS.TRAINING_CLASSES.STUDENTS(id)),
  searchAvailableStudents: (id: string, search?: string): Promise<ApiResponse<{ id: string; code: string; fullName: string }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; code: string; fullName: string }[]>>(ENDPOINTS.TRAINING_CLASSES.AVAILABLE_STUDENTS(id), { params: search ? { search } : undefined }),
  assignStudent: (id: string, studentCode: string): Promise<ApiResponse<{ id: string; code: string; fullName: string }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; code: string; fullName: string }>>(ENDPOINTS.TRAINING_CLASSES.STUDENTS(id), { studentCode }),
  getSemesters: (id: string): Promise<ApiResponse<{ id: string; code: number; schoolYear: string; gradeClosedAt?: string | null }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; code: number; schoolYear: string; gradeClosedAt?: string | null }[]>>(ENDPOINTS.TRAINING_CLASSES.SEMESTERS(id)),
  createSemester: (id: string, data: { code: number; schoolYear: string }): Promise<ApiResponse<{ id: string; code: number; schoolYear: string }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; code: number; schoolYear: string }>>(ENDPOINTS.TRAINING_CLASSES.SEMESTERS(id), data),
  getSubjects: (id: string, semesterId: string): Promise<ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }[]>>(ENDPOINTS.TRAINING_CLASSES.SUBJECTS(id, semesterId)),
  createSubject: (id: string, semesterId: string, data: { catalogSubjectId: string } | { subjectCode: string; subjectName: string; credits: number }): Promise<ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }>>(ENDPOINTS.TRAINING_CLASSES.SUBJECTS(id, semesterId), data),
  getTimeTable: (id: string, semesterId: string): Promise<ApiResponse<{ schedules: TrainingClassLesson[] }>> =>
    apiClient.get<unknown, ApiResponse<{ schedules: TrainingClassLesson[] }>>(ENDPOINTS.TRAINING_CLASSES.TIME_TABLE(id, semesterId)),
  saveTimeTable: (id: string, semesterId: string, schedules: TrainingClassLesson[]): Promise<ApiResponse<{ schedules: TrainingClassLesson[] }>> =>
    apiClient.put<unknown, ApiResponse<{ schedules: TrainingClassLesson[] }>>(ENDPOINTS.TRAINING_CLASSES.TIME_TABLE(id, semesterId), { schedules }),
  createClass: (data: CreateTrainingClass): Promise<ApiResponse<TrainingClass>> =>
    apiClient.post<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.BASE, data),
  updateClass: (id: string, data: UpdateTrainingClass): Promise<ApiResponse<TrainingClass>> =>
    apiClient.put<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.CLASS(id), data),
  updateClassStatus: (id: string, status: "ACTIVE" | "INACTIVE"): Promise<ApiResponse<TrainingClass>> =>
    apiClient.patch<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.CLASS_STATUS(id), { status }),
};
