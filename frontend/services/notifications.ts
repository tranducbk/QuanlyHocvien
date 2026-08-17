import { ENDPOINTS } from "@/constants/endpoints";
import {
  Notification,
  NotificationQueryRequest,
} from "@/types/notifications";
import apiClient from "./axios-client";

export const notificationService = {
  getNotifications: async (
    params?: NotificationQueryRequest
  ): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get(ENDPOINTS.AUTH.NOTIFICATIONS, { params });
  },

  getNotificationDetail: async (
    id: string
  ): Promise<ApiResponse<Notification>> => {
    return apiClient.get(ENDPOINTS.AUTH.NOTIFICATION_DETAIL(id));
  },

  markRead: async (id: string): Promise<ApiResponse> => {
    return apiClient.put(ENDPOINTS.AUTH.MARK_NOTIFICATION_READ(id));
  },

  markAllRead: async (): Promise<ApiResponse> => {
    return apiClient.put(ENDPOINTS.AUTH.MARK_ALL_NOTIFICATIONS_READ);
  },

  deleteNotification: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete(ENDPOINTS.AUTH.NOTIFICATION_DETAIL(id));
  },
};
