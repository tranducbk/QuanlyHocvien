import apiClient from "@/services/axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import type { AvailableStudent, PlacementDetail, PlacementYear } from "@/types/training-program/he5-placement";

const endpoints = ENDPOINTS.HE5_PLACEMENT;
export const he5PlacementService = {
  years: (): Promise<ApiResponse<PlacementYear[]>> => apiClient.get(endpoints.YEARS),
  detail: (id: string): Promise<ApiResponse<PlacementDetail>> => apiClient.get(endpoints.YEAR(id)),
  available: (id: string): Promise<ApiResponse<AvailableStudent[]>> => apiClient.get(endpoints.AVAILABLE(id)),
  prepareNext: (): Promise<ApiResponse<PlacementYear>> => apiClient.post(endpoints.YEARS),
  assign: (id: string, profileIds: string[], trainingClassId: string): Promise<ApiResponse<{ updated: number }>> => apiClient.post(endpoints.ASSIGN(id), { profileIds, trainingClassId }),
  graduate: (id: string, profileIds: string[]): Promise<ApiResponse<{ updated: number }>> => apiClient.post(endpoints.GRADUATE(id), { profileIds }),
  close: (id: string): Promise<ApiResponse<PlacementYear>> => apiClient.post(endpoints.CLOSE(id)),
};
