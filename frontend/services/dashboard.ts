import { ENDPOINTS } from "@/constants/endpoints";
import {
  AdminDashboard,
  CommanderDashboard,
  StudentDashboard,
} from "@/types/dashboard";
import apiClient from "./axios-client";

export const dashboardService = {
  getAdminDashboard: async (): Promise<ApiResponse<AdminDashboard>> => {
    return apiClient.get(ENDPOINTS.REPORTS.ADMIN_DASHBOARD);
  },

  getCommanderDashboard: async (): Promise<ApiResponse<CommanderDashboard>> => {
    return apiClient.get(ENDPOINTS.REPORTS.COMMANDER_DASHBOARD);
  },

  getStudentDashboard: async (): Promise<ApiResponse<StudentDashboard>> => {
    return apiClient.get(ENDPOINTS.REPORTS.STUDENT_DASHBOARD);
  },
};
