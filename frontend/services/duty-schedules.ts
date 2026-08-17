import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import { DutySchedule, CreateDutyScheduleRequest, UpdateDutyScheduleRequest, DutyScheduleQueryRequest } from "@/types/duty-schedules";

export const dutyScheduleService = {
  getDutySchedules: async (params?: DutyScheduleQueryRequest): Promise<PaginatedResponse<DutySchedule>> => {
    return apiClient.get(ENDPOINTS.DUTY_SCHEDULES.BASE, { params });
  },

  createDutySchedule: async (data: CreateDutyScheduleRequest) => {
    return apiClient.post(ENDPOINTS.DUTY_SCHEDULES.BASE, data);
  },

  updateDutySchedule: async (id: string, data: UpdateDutyScheduleRequest) => {
    return apiClient.put(`${ENDPOINTS.DUTY_SCHEDULES.BASE}/${id}`, data);
  },

  deleteDutySchedule: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.DUTY_SCHEDULES.BASE}/${id}`);
  },
};
