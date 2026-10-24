import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CreateTrainingClass, TrainingClass, TrainingClassOptions } from "@/types/training-classes";

export type TrainingClassLesson = { subjectId: string; day: number; startTime: string; endTime: string; room?: string | null; week?: number[] };

export const trainingClassService = {
  getClasses: (): Promise<ApiResponse<TrainingClass[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingClass[]>>(ENDPOINTS.TRAINING_CLASSES.BASE),
  getMine: (): Promise<ApiResponse<TrainingClass[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingClass[]>>(ENDPOINTS.TRAINING_CLASSES.MINE),
  getStudents: (id: string): Promise<ApiResponse<{ id: string; userId: string; code: string; fullName: string }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; userId: string; code: string; fullName: string }[]>>(ENDPOINTS.TRAINING_CLASSES.STUDENTS(id)),
  assignStudent: (id: string, studentCode: string): Promise<ApiResponse<{ id: string; code: string; fullName: string }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; code: string; fullName: string }>>(ENDPOINTS.TRAINING_CLASSES.STUDENTS(id), { studentCode }),
  getSemesters: (id: string): Promise<ApiResponse<{ id: string; code: number; schoolYear: string }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; code: number; schoolYear: string }[]>>(ENDPOINTS.TRAINING_CLASSES.SEMESTERS(id)),
  createSemester: (id: string, data: { code: number; schoolYear: string }): Promise<ApiResponse<{ id: string; code: number; schoolYear: string }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; code: number; schoolYear: string }>>(ENDPOINTS.TRAINING_CLASSES.SEMESTERS(id), data),
  getSubjects: (id: string, semesterId: string): Promise<ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }[]>> =>
    apiClient.get<unknown, ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }[]>>(ENDPOINTS.TRAINING_CLASSES.SUBJECTS(id, semesterId)),
  createSubject: (id: string, semesterId: string, data: { subjectCode: string; subjectName: string; credits: number }): Promise<ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }>> =>
    apiClient.post<unknown, ApiResponse<{ id: string; subjectCode: string; subjectName: string; credits: number }>>(ENDPOINTS.TRAINING_CLASSES.SUBJECTS(id, semesterId), data),
  getTimeTable: (id: string, semesterId: string): Promise<ApiResponse<{ schedules: TrainingClassLesson[] }>> =>
    apiClient.get<unknown, ApiResponse<{ schedules: TrainingClassLesson[] }>>(ENDPOINTS.TRAINING_CLASSES.TIME_TABLE(id, semesterId)),
  saveTimeTable: (id: string, semesterId: string, schedules: TrainingClassLesson[]): Promise<ApiResponse<{ schedules: TrainingClassLesson[] }>> =>
    apiClient.put<unknown, ApiResponse<{ schedules: TrainingClassLesson[] }>>(ENDPOINTS.TRAINING_CLASSES.TIME_TABLE(id, semesterId), { schedules }),
  getOptions: (): Promise<ApiResponse<TrainingClassOptions>> =>
    apiClient.get<unknown, ApiResponse<TrainingClassOptions>>(ENDPOINTS.TRAINING_CLASSES.OPTIONS),
  createClass: (data: CreateTrainingClass): Promise<ApiResponse<TrainingClass>> =>
    apiClient.post<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.BASE, data),
  assignCommander: (id: string, commanderId: string | null): Promise<ApiResponse<TrainingClass>> =>
    apiClient.put<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.COMMANDER(id), { commanderId }),
};
