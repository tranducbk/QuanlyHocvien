import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type { CreateTrainingClass, TrainingClass, TrainingClassOptions } from "@/types/training-classes";

export const trainingClassService = {
  getClasses: (): Promise<ApiResponse<TrainingClass[]>> =>
    apiClient.get<unknown, ApiResponse<TrainingClass[]>>(ENDPOINTS.TRAINING_CLASSES.BASE),
  getOptions: (): Promise<ApiResponse<TrainingClassOptions>> =>
    apiClient.get<unknown, ApiResponse<TrainingClassOptions>>(ENDPOINTS.TRAINING_CLASSES.OPTIONS),
  createClass: (data: CreateTrainingClass): Promise<ApiResponse<TrainingClass>> =>
    apiClient.post<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.BASE, data),
  assignCommander: (id: string, commanderId: string | null): Promise<ApiResponse<TrainingClass>> =>
    apiClient.put<unknown, ApiResponse<TrainingClass>>(ENDPOINTS.TRAINING_CLASSES.COMMANDER(id), { commanderId }),
};
