export interface Class {
  id: string;
  className: string;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
  universityId?: string;
  universityName?: string;
  organizationId?: string;
  organizationName?: string;
  educationLevelId?: string;
  levelName?: string;
}

export interface CreateClassRequest {
  className: string;
  studentCount?: number;
  educationLevelId: string;
}

export interface UpdateClassRequest {
  className?: string;
  studentCount?: number;
}

export interface AssignStudentsBatchRequest {
  studentCodes: string[];
}

export interface AssignStudentsRequest {
  userIds: string[];
}

export interface ClassQueryRequest extends QueryRequest {
  educationLevelId?: string;
  className?: string;
}
