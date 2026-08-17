import { Semester } from "./semesters";

export type TuitionFeeStatus = "PAID" | "UNPAID";

export interface TuitionFee {
  id: string;
  userId?: string;
  semesterId?: string | null;
  studentId: string;
  totalAmount: number;
  semester: string;
  schoolYear: string;
  content: string;
  status: TuitionFeeStatus;
  createdAt: string;
  updatedAt: string;
  semesterInfo?: Semester | null;
  user?: {
    id: string;
    username: string;
    profile?: {
      code?: string | null;
      fullName?: string | null;
    } | null;
  } | null;
}

export interface TuitionFeeQueryRequest extends QueryRequest {
  studentId?: string;
  schoolYear?: string;
  semester?: string;
  status?: TuitionFeeStatus;
}

export interface CreateTuitionFeeRequest {
  userId: string;
  totalAmount: number;
  semester: string;
  schoolYear: string;
  content: string;
  status: TuitionFeeStatus;
}

export type UpdateTuitionFeeRequest = CreateTuitionFeeRequest;
