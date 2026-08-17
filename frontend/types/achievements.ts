export interface Achievement {
  id: string;
  userId: string;
  semester?: string | null;
  schoolYear?: string | null;
  content?: string | null;
  year?: number | null;
  title?: string | null;
  description?: string | null;
  award?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    username: string;
    profile?: {
      code?: string | null;
      fullName?: string | null;
      unit?: string | null;
      class?: {
        className?: string | null;
      } | null;
      organization?: {
        organizationName?: string | null;
      } | null;
    } | null;
  } | null;
}

export interface AchievementQueryRequest extends QueryRequest {
  userId?: string;
  fullName?: string;
  unit?: string;
  semester?: string;
  schoolYear?: string;
  year?: number;
  award?: string;
}

export interface CreateAchievementRequest {
  userId: string;
  semester?: string | null;
  schoolYear?: string | null;
  content?: string | null;
  year?: number | null;
  title?: string | null;
  description?: string | null;
  award?: string | null;
}

export type UpdateAchievementRequest = CreateAchievementRequest;

export interface MyAchievementsResponse {
  achievements: Achievement[];
}
