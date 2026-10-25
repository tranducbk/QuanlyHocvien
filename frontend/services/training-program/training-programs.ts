import apiClient from "../axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
  TrainingSystemOption,
  TrainingProgram,
  CurriculumVersion,
  CreateTrainingProgram,
  CreateCurriculumVersion,
} from "@/types/training-program/training-programs";

export const trainingProgramService = {
  getSystems: (): Promise<ApiResponse<TrainingSystemOption[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingSystemOption[]>>(ENDPOINTS.TRAINING_PROGRAMS.SYSTEMS),
  getPrograms: (): Promise<ApiResponse<TrainingProgram[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingProgram[]>>(ENDPOINTS.TRAINING_PROGRAMS.BASE),
  createProgram: (data: CreateTrainingProgram): Promise<ApiResponse<TrainingProgram>> =>
    apiClient.post<unknown, ApiResponse<TrainingProgram>>(ENDPOINTS.TRAINING_PROGRAMS.BASE, data),
  createVersion: (programId: string, data: CreateCurriculumVersion): Promise<ApiResponse<CurriculumVersion>> =>
    apiClient.post<unknown, ApiResponse<CurriculumVersion>>(ENDPOINTS.TRAINING_PROGRAMS.VERSIONS(programId), data),
};
