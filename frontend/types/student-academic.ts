export interface SubjectResult {
  id: string;
  semesterResultId: string;
  subjectCode?: string | null;
  subjectName?: string | null;
  credits?: number | null;
  letterGrade?: string | null;
  gradePoint4?: number | null;
  gradePoint10?: number | null;
  note?: string | null;
  semesterResult?: SemesterResult;
  createdAt?: string;
  updatedAt?: string;
}

export interface SemesterResult {
  id: string;
  userId: string;
  yearlyResultId: string;
  semester?: string | null;
  schoolYear?: string | null;
  totalCredits?: number | null;
  averageGrade4?: number | null;
  averageGrade10?: number | null;
  cumulativeCredits?: number | null;
  cumulativeGrade4?: number | null;
  cumulativeGrade10?: number | null;
  debtCredits?: number | null;
  failedSubjects?: number | null;
  subjectResults?: SubjectResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface YearlyResult {
  id: string;
  userId: string;
  schoolYear?: string | null;
  totalCredits?: number | null;
  cumulativeCredits?: number | null;
  totalSubjects?: number | null;
  passedSubjects?: number | null;
  failedSubjects?: number | null;
  debtCredits?: number | null;
  averageGrade4?: number | null;
  averageGrade10?: number | null;
  cumulativeGrade4?: number | null;
  cumulativeGrade10?: number | null;
  academicStatus?: string | null;
  studentLevel?: string | null;
  semesterIds?: string[] | null;
  partyRating?: string | null;
  trainingRating?: string | null;
  partyRatingDecisionNumber?: string | null;
  semesterResults?: SemesterResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicResultQueryRequest extends QueryRequest {
  schoolYear?: string;
}

export type GradeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type GradeRequestType = "ADD" | "UPDATE" | "DELETE";

export const statusMap: Record<GradeRequestStatus, { label: string; variant: "warning" | "success" | "error" }> = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  APPROVED: { label: "Đã duyệt", variant: "success" },
  REJECTED: { label: "Từ chối", variant: "error" },
};

export const requestTypeMap: Record<GradeRequestType, string> = {
  ADD: "Bổ sung kết quả",
  UPDATE: "Điều chỉnh điểm",
  DELETE: "Xóa kết quả sai",
};

export interface GradeRequest {
  id: string;
  userId: string;
  user?: {
    profile?: {
      fullName?: string;
      code?: string;
    }
  };
  subjectResultId: string;
  requestType: GradeRequestType;
  status: GradeRequestStatus;
  reason?: string | null;
  proposedLetterGrade?: string | null;
  proposedGradePoint4?: number | null;
  proposedGradePoint10?: number | null;
  attachmentUrl?: string | null;
  reviewNote?: string | null;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  subjectResult?: SubjectResult;
  reviewer?: {
    id: string;
    username: string;
  } | null;
}

export interface GradeRequestQueryRequest extends QueryRequest {
  status?: GradeRequestStatus;
  userId?: string;
  requestType?: GradeRequestType;
  fullName?: string;
  unit?: string;
  semester?: string;
  schoolYear?: string;
}

export interface CreateGradeRequestRequest {
  subjectResultId: string;
  requestType: GradeRequestType;
  reason: string;
  proposedGradePoint10?: number;
  attachmentUrl?: string;
}

export interface ReviewGradeRequestRequest {
  reviewNote?: string;
}
