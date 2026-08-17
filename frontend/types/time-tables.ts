export interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  subjectName?: string | null;
  week?: number | number[] | null;
}

export interface ScheduleFormItem {
  day: string;
  timeRange: {
    startTime: string;
    endTime: string;
  };
  room: string;
  subjectName?: string | null;
  /** Danh sách tuần học áp dụng cho ca học (form dùng MultiSelect) */
  week?: number[] | null;
}

export type ScheduleInput = ScheduleItem | ScheduleFormItem;

export interface TimeTableProfile {
  id?: string;
  avatar?: string;
  fullName?: string;
  code?: string;
  unit?: string;
}

export interface TimeTableUser {
  id: string;
  username?: string;
  role?: string;
  profile?: TimeTableProfile;
}

export interface TimeTableSemester {
  id: string;
  code: number;
  schoolYearInfo?: {
    id: string;
    schoolYear: string;
  } | null;
}

export interface TimeTable {
  id: string;
  userId: string;
  semesterId?: string | null;
  semester?: TimeTableSemester | null;
  schedules: ScheduleItem[] | null;
  scheduleCount?: number;
  subjectNames?: string[];
  weeks?: Array<number | string>;
  rooms?: string[];
  user?: TimeTableUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeTableRequest {
  userId: string;
  semesterId?: string | null;
  schedules?: ScheduleInput[] | null;
}

export interface UpdateTimeTableRequest {
  userId?: string;
  semesterId?: string | null;
  schedules?: ScheduleInput[] | null;
}

export interface TimeTableQueryRequest extends QueryRequest {
  userId?: string;
  fullName?: string;
  semesterId?: string;
  semester?: string | number;
  schoolYear?: string;
}

export interface TimeTableReportRow {
  unit: string;
  fullName: string;
  semester?: string;
  schoolYear?: string;
  scheduleCount: number;
  subjectName: string;
  room: string;
  week: number | number[] | string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface TimeTableReport {
  summary: {
    totalStudents: number;
    totalSchedules: number;
    totalSubjects: number;
    totalWeeks: number;
  };
  data: TimeTableReportRow[];
}
