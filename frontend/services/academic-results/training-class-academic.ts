import apiClient from "../axios-client";
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
  trainingClassSubject: { id: string; subjectCode: string; subjectName: string; credits?: number };
  trainingClassSemester: { id: string; code: number; schoolYear: string };
};
export type GradeProposal = Omit<GradeInput, "midtermScore" | "finalScore"> & {
  id: string;
  profileId: string;
  trainingClassId: string;
  semesterId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  createdAt: string;
  midtermScore: string;
  finalScore: string;
  reviewNote: string | null;
  profile?: { id: string; code: string; fullName: string };
  trainingClassSubject: { id: string; subjectCode: string; subjectName: string };
  trainingClassSemester: { id: string; code: number; schoolYear: string };
};
export type StudentClassSubject = { id: string; subjectCode: string; subjectName: string; trainingClassSemester: { id: string; code: number; schoolYear: string } };
export type StudentClassTimeTable = {
  id: string;
  trainingClassId: string;
  semesterId: string;
  trainingClassSemester: { id: string; code: number; schoolYear: string } | null;
  schedules: Array<{
    subjectId: string;
    subjectCode: string | null;
    subjectName: string | null;
    day: number;
    startTime: string;
    endTime: string;
    room: string | null;
    week: number[];
  }>;
};
export type StudentClassAchievement = {
  id: string;
  studentUserId: string;
  category: "AWARD" | "SCIENTIFIC_TOPIC" | "SCIENTIFIC_INITIATIVE";
  title: string;
  award: string | null;
  schoolYear: string | null;
  semester: string | null;
  content: string | null;
  year: number | null;
  description: string | null;
  createdAt: string;
};
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
  getMyTimeTables: (): Promise<ApiResponse<StudentClassTimeTable[]>> =>
    apiClient.get<unknown, ApiResponse<StudentClassTimeTable[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_TIME_TABLES),
  getMyAchievements: (): Promise<ApiResponse<StudentClassAchievement[]>> =>
    apiClient.get<unknown, ApiResponse<StudentClassAchievement[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_ACHIEVEMENTS),
  getMyResults: (): Promise<ApiResponse<GradeResult[]>> =>
    apiClient.get<unknown, ApiResponse<GradeResult[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_RESULTS),
  getMyProposals: (): Promise<ApiResponse<GradeProposal[]>> =>
    apiClient.get<unknown, ApiResponse<GradeProposal[]>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_GRADE_PROPOSALS),
  createProposal: (data: GradeInput & { reason: string }): Promise<ApiResponse<GradeProposal>> =>
    apiClient.post<unknown, ApiResponse<GradeProposal>>(ENDPOINTS.TRAINING_CLASS_ACADEMIC.MY_GRADE_PROPOSALS, data),
};
