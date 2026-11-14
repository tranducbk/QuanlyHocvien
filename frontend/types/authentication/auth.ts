export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  isActive: boolean;
  role: "ADMIN" | "COMMANDER" | "STUDENT";
  systemType: "EXTERNAL" | "MILITARY" | null;
  trainingSystemId: string | null;
  trainingSystemCode: "HE_1" | "HE_3" | "HE_4" | "HE_5" | "HE_7" | null;
  refreshToken: string;
  studentId: string | null;
  commanderId: string | null;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: "ADMIN" | "COMMANDER" | "STUDENT";
  trainingSystemCode?: "HE_1" | "HE_3" | "HE_4" | "HE_5" | "HE_7";
  fullName: string;
  email?: string;
  commanderId?: string | null;
}
