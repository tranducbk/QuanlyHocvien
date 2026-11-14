export type NotificationType =
  | "GRADE"
  | "CUT_RICE"
  | "ACHIEVEMENT"
  | "TUITION"
  | "GENERAL";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content?: string | null;
  type?: NotificationType | string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryRequest extends QueryRequest {
  type?: NotificationType | string;
  isRead?: boolean | string;
}
