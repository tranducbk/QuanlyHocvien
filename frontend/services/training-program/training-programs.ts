import apiClient from "../axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type {
  TrainingProgram,
  CurriculumVersion,
  CreateTrainingProgram,
  CreateCurriculumVersion,
  UpdateTrainingProgram,
} from "@/types/training-program/training-programs";

export const trainingProgramService = {
  getPrograms: (params?: { universityId?: string }): Promise<ApiResponse<TrainingProgram[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingProgram[]>>(ENDPOINTS.TRAINING_PROGRAMS.BASE, { params }),
  createProgram: (data: CreateTrainingProgram): Promise<ApiResponse<TrainingProgram>> =>
    apiClient.post<unknown, ApiResponse<TrainingProgram>>(ENDPOINTS.TRAINING_PROGRAMS.BASE, data),
  updateProgram: (id: string, data: UpdateTrainingProgram): Promise<ApiResponse<TrainingProgram>> =>
    apiClient.put<unknown, ApiResponse<TrainingProgram>>(ENDPOINTS.TRAINING_PROGRAMS.PROGRAM(id), data),
  updateProgramStatus: (id: string, isActive: boolean): Promise<ApiResponse<TrainingProgram>> =>
    apiClient.patch<unknown, ApiResponse<TrainingProgram>>(ENDPOINTS.TRAINING_PROGRAMS.PROGRAM_STATUS(id), { isActive }),
  createVersion: (programId: string, data: CreateCurriculumVersion): Promise<ApiResponse<CurriculumVersion>> =>
    apiClient.post<unknown, ApiResponse<CurriculumVersion>>(ENDPOINTS.TRAINING_PROGRAMS.VERSIONS(programId), data),
};
