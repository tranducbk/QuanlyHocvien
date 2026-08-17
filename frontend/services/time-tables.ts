import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  CreateTimeTableRequest,
  ScheduleInput,
  ScheduleItem,
  TimeTable,
  TimeTableSemester,
  TimeTableQueryRequest,
  TimeTableReport,
  UpdateTimeTableRequest,
} from "@/types/time-tables";

const normalizeSchedule = (schedule: ScheduleInput): ScheduleItem => {
  let base: Omit<ScheduleItem, "week">;
  let week: number | number[] | null | undefined;

  if ("timeRange" in schedule) {
    const { timeRange, week: scheduleWeek, ...rest } = schedule;
    base = {
      ...rest,
      startTime: timeRange.startTime,
      endTime: timeRange.endTime,
    };
    week = scheduleWeek;
  } else {
    const { week: scheduleWeek, ...rest } = schedule;
    base = rest;
    week = scheduleWeek;
  }

  return {
    ...base,
    week: Array.isArray(week) ? week : week ?? null,
  };
};

const normalizeTimeTablePayload = <
  T extends CreateTimeTableRequest | UpdateTimeTableRequest
>(
  data: T
) => ({
  ...data,
  schedules: data.schedules?.map(normalizeSchedule) ?? data.schedules,
});

export const timeTableService = {
  getTimeTables: async (
    params?: TimeTableQueryRequest
  ): Promise<PaginatedResponse<TimeTable>> => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.BASE, { params });
  },

  getTimeTable: async (id: string): Promise<TimeTable> => {
    return apiClient.get(`${ENDPOINTS.TIME_TABLES.BASE}/${id}`);
  },

  getMyTimeTables: async (
    params?: TimeTableQueryRequest
  ): Promise<PaginatedResponse<TimeTable>> => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.TIME_TABLE, { params });
  },

  getMyTimeTableSemesters: async (): Promise<
    ApiResponse<TimeTableSemester[]>
  > => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.MY_SEMESTERS);
  },

  createTimeTable: async (data: CreateTimeTableRequest) => {
    return apiClient.post(
      ENDPOINTS.TIME_TABLES.BASE,
      normalizeTimeTablePayload(data)
    );
  },

  updateTimeTable: async (id: string, data: UpdateTimeTableRequest) => {
    return apiClient.put(
      `${ENDPOINTS.TIME_TABLES.BASE}/${id}`,
      normalizeTimeTablePayload(data)
    );
  },

  deleteTimeTable: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.TIME_TABLES.BASE}/${id}`);
  },

  importTimeTables: async (
    file: File
  ): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(ENDPOINTS.TIME_TABLES.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.TEMPLATE, {
      responseType: "blob",
    });
  },

  exportTimeTables: async (params?: TimeTableQueryRequest): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.EXPORT, {
      params,
      responseType: "blob",
    });
  },

  getReport: async (): Promise<TimeTableReport> => {
    return apiClient.get(ENDPOINTS.TIME_TABLES.REPORT);
  },
};
