import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";

export type GradeInput = {
  subjectId: string;
  attemptNo: number;
  midtermScore: number;
  finalScore: number;
};
export type GradeResult = Omit<GradeInput, "midtermScore" | "finalScore"> & {
  id: string;
  profileId: string;
  trainingClassId: string;
  semesterId: string;
  totalScore: string;
  midtermScore: string;
  finalScore: string;
  isBestAttempt: boolean;
  classification: "FAIL" | "AVERAGE" | "GOOD" | "EXCELLENT";
  profile: { id: string; code: string; fullName: string };
  trainingClassSubject: { id: string; subjectCode: string; subjectName: string };
  trainingClassSemester: { id: string; code: number; schoolYear: string };
};
export type GradeProposal = Omit<GradeInput, "midtermScore" | "finalScore"> & {
  id: string;
  profileId: string;
  trainingClassId: string;
  semesterId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  midtermScore: string;
  finalScore: string;
  reviewNote: string | null;
  profile?: { id: string; code: string; fullName: string };
  trainingClassSubject: { id: string; subjectCode: string; subjectName: string };
  trainingClassSemester: { id: string; code: number; schoolYear: string };
};
export type StudentClassSubject = { id: string; subjectCode: string; subjectName: string; trainingClassSemester: { id: string; code: number; schoolYear: string } };
export type AcademicSummaryRow = {
  profileId: string; student: { id: string; code: string; fullName: string; unit?: string | null };
  schoolYear: string; semester?: number;
  subjectCount: number; passedSubjects: number; failedSubjects: number;
  totalCredits: number; debtCredits: number;
  cumulativeCredits: number;
  averageGrade10: number | null; averageGrade4: number | null;
  cumulativeGrade10: number | null; cumulativeGrade4: number | null;
};

export const trainingClassAcademicService = {
  getClassResults: (classId: string, semesterId?: string): Promise<ApiResponse<GradeResult[]>> =>
    apiClient.get<unknown, ApiResponse<GradeResult[]>>(ENDPOINTS.TRAINING_CLASSES.RESULTS(classId), { params: semesterId ? { semesterId } : {} }),
  getClassSummary: (classId: string): Promise<ApiResponse<{ semesters: AcademicSummaryRow[]; years: AcademicSummaryRow[] }>> =>
    apiClient.get(ENDPOINTS.TRAINING_CLASSES.RESULTS_SUMMARY(classId)),
  exportYearlySummary: (classId: string, params?: Record<string, unknown>): Promise<Blob> =>
    apiClient.get(ENDPOINTS.TRAINING_CLASSES.RESULTS_EXPORT(classId), { params, responseType: "blob" }),
  createResult: (classId: string, data: GradeInput & { profileId: string }): Promise<ApiResponse<GradeResult>> =>
    apiClient.post<unknown, ApiResponse<GradeResult>>(ENDPOINTS.TRAINING_CLASSES.RESULTS(classId), data),
  getClassProposals: (classId: string, status?: GradeProposal["status"]): Promise<ApiResponse<GradeProposal[]>> =>
    apiClient.get<unknown, ApiResponse<GradeProposal[]>>(ENDPOINTS.TRAINING_CLASSES.GRADE_PROPOSALS(classId), { params: status ? { status } : {} }),
  reviewProposal: (classId: string, proposalId: string, decision: "approve" | "reject", reviewNote?: string): Promise<ApiResponse<GradeProposal>> =>
    apiClient.post<unknown, ApiResponse<GradeProposal>>(ENDPOINTS.TRAINING_CLASSES.REVIEW_GRADE_PROPOSAL(classId, proposalId, decision), { reviewNote }),
  getMySubjects: (): Promise<ApiResponse<StudentClassSubject[]>> =>
    apiClient.get<unknown, ApiResponse<StudentClassSubject[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_SUBJECTS),
  getMyResults: (): Promise<ApiResponse<GradeResult[]>> =>
    apiClient.get<unknown, ApiResponse<GradeResult[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_RESULTS),
  getMyProposals: (): Promise<ApiResponse<GradeProposal[]>> =>
    apiClient.get<unknown, ApiResponse<GradeProposal[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_GRADE_PROPOSALS),
  createProposal: (data: GradeInput & { reason: string }): Promise<ApiResponse<GradeProposal>> =>
    apiClient.post<unknown, ApiResponse<GradeProposal>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_GRADE_PROPOSALS, data),
};
