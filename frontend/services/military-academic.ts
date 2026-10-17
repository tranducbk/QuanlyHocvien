import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  MilitaryAchievement,
  MilitaryDutySchedule,
  MilitaryGradeProposal,
  MilitaryScheduleItem,
  MilitarySemester,
  MilitarySubject,
  MilitarySubjectResult,
  MilitaryTimeTable,
} from "@/types/military-academic";

export const militaryAcademicService = {
  getSemesters: (): Promise<PaginatedResponse<MilitarySemester>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.SEMESTERS, {
      params: { limit: 100 },
    }),
  createSemester: (
    data: Pick<MilitarySemester, "code" | "schoolYear">
  ): Promise<ApiResponse<MilitarySemester>> =>
    apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.SEMESTERS, data),
  updateSemester: (
    id: string,
    data: Pick<MilitarySemester, "code" | "schoolYear">
  ): Promise<ApiResponse<MilitarySemester>> =>
    apiClient.put(ENDPOINTS.MILITARY_ACADEMIC.SEMESTER_DETAIL(id), data),
  deleteSemester: (id: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_ACADEMIC.SEMESTER_DETAIL(id)),
  getSubjects: (classId: string): Promise<PaginatedResponse<MilitarySubject>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.SUBJECTS(classId), {
      params: { limit: 100 },
    }),
  createSubject: (
    classId: string,
    data: Omit<MilitarySubject, "id" | "classId">
  ): Promise<ApiResponse<MilitarySubject>> =>
    apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.SUBJECTS(classId), data),
  updateSubject: (
    classId: string,
    id: string,
    data: Omit<MilitarySubject, "id" | "classId">
  ): Promise<ApiResponse<MilitarySubject>> =>
    apiClient.put(
      ENDPOINTS.MILITARY_ACADEMIC.SUBJECT_DETAIL(classId, id),
      data
    ),
  deleteSubject: (classId: string, id: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_ACADEMIC.SUBJECT_DETAIL(classId, id)),
  getTimeTable: (
    classId: string,
    semesterId: string
  ): Promise<ApiResponse<MilitaryTimeTable | null>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.TIME_TABLE(classId), {
      params: { semesterId },
    }),
  saveTimeTable: (
    classId: string,
    semesterId: string,
    schedules: MilitaryScheduleItem[]
  ): Promise<ApiResponse<MilitaryTimeTable>> =>
    apiClient.put(ENDPOINTS.MILITARY_ACADEMIC.TIME_TABLE(classId), {
      semesterId,
      schedules,
    }),
  getMyTimeTable: (): Promise<ApiResponse<MilitaryTimeTable[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.MY_TIME_TABLE),
  getMySubjects: (): Promise<ApiResponse<MilitarySubject[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.MY_SUBJECTS),
  getMyResults: (): Promise<ApiResponse<MilitarySubjectResult[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.MY_RESULTS),
  getMyGradeProposals: (): Promise<ApiResponse<MilitaryGradeProposal[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.MY_GRADE_PROPOSALS),
  createGradeProposal: (
    data: Omit<MilitaryGradeProposal, "id" | "profileId" | "userId" | "status">
  ): Promise<ApiResponse<MilitaryGradeProposal>> =>
    apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.MY_GRADE_PROPOSALS, data),
  getClassResults: (
    classId: string,
    semesterId: string
  ): Promise<ApiResponse<MilitarySubjectResult[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.CLASS_RESULTS(classId), {
      params: { semesterId },
    }),
  createClassResult: (
    classId: string,
    data: Pick<
      MilitarySubjectResult,
      | "profileId"
      | "militarySubjectId"
      | "letterGrade"
      | "gradePoint4"
      | "gradePoint10"
    >
  ): Promise<ApiResponse<MilitarySubjectResult>> =>
    apiClient.post(ENDPOINTS.MILITARY_ACADEMIC.CLASS_RESULTS(classId), data),
  getClassGradeProposals: (
    classId: string,
    status?: string
  ): Promise<ApiResponse<MilitaryGradeProposal[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_ACADEMIC.CLASS_GRADE_PROPOSALS, {
      params: { classId, status },
    }),
  reviewGradeProposal: (
    id: string,
    approved: boolean,
    reviewNote?: string
  ): Promise<ApiResponse<MilitaryGradeProposal>> =>
    apiClient.post(
      approved
        ? ENDPOINTS.MILITARY_ACADEMIC.APPROVE_GRADE_PROPOSAL(id)
        : ENDPOINTS.MILITARY_ACADEMIC.REJECT_GRADE_PROPOSAL(id),
      { reviewNote }
    ),
  getClassAchievements: (
    classId: string
  ): Promise<ApiResponse<MilitaryAchievement[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_RECORDS.ACHIEVEMENTS, {
      params: { classId },
    }),
  getMyAchievements: (): Promise<ApiResponse<MilitaryAchievement[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_RECORDS.MY_ACHIEVEMENTS),
  createAchievement: (
    classId: string,
    data: Omit<MilitaryAchievement, "id" | "classId">
  ): Promise<ApiResponse<MilitaryAchievement>> =>
    apiClient.post(
      ENDPOINTS.MILITARY_RECORDS.CLASS_ACHIEVEMENTS(classId),
      data
    ),
  updateAchievement: (
    id: string,
    data: Partial<MilitaryAchievement>
  ): Promise<ApiResponse<MilitaryAchievement>> =>
    apiClient.put(ENDPOINTS.MILITARY_RECORDS.ACHIEVEMENT_DETAIL(id), data),
  deleteAchievement: (id: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_RECORDS.ACHIEVEMENT_DETAIL(id)),
  getClassDutySchedules: (
    classId: string
  ): Promise<ApiResponse<MilitaryDutySchedule[]>> =>
    apiClient.get(ENDPOINTS.MILITARY_RECORDS.DUTY_SCHEDULES, {
      params: { classId },
    }),
  createDutySchedule: (
    classId: string,
    data: Pick<MilitaryDutySchedule, "userId" | "position" | "workDay">
  ) =>
    apiClient.post(
      ENDPOINTS.MILITARY_RECORDS.CLASS_DUTY_SCHEDULES(classId),
      data
    ),
  updateDutySchedule: (
    id: string,
    data: Partial<Pick<MilitaryDutySchedule, "userId" | "position" | "workDay">>
  ) => apiClient.put(ENDPOINTS.MILITARY_RECORDS.DUTY_SCHEDULE_DETAIL(id), data),
  deleteDutySchedule: (id: string) =>
    apiClient.delete(ENDPOINTS.MILITARY_RECORDS.DUTY_SCHEDULE_DETAIL(id)),
};
