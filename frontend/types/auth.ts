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
  fullName: string;
  email?: string;
  commanderId?: string | null;
}
