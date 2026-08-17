export interface DutySchedule {
  id: string;
  userId: string;
  fullName: string;
  rank: string;
  phoneNumber: string;
  position: string;
  workDay: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDutyScheduleRequest {
  userId: string;
  position: string;
  workDay: string;
}

export interface UpdateDutyScheduleRequest {
  position?: string;
  workDay?: string;
}

export interface DutyScheduleQueryRequest extends QueryRequest {
  fullName?: string;
  position?: string;
  workDay?: string;
}