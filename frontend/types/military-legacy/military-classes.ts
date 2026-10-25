export interface MilitaryClass {
  id: string;
  className: string;
  classCode: string;
  studentCount: number;
  commanderId: string;
  commander?: { id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

export interface MilitaryClassRequest {
  className: string;
  classCode: string;
  commanderId: string;
}

export interface MilitaryStudentProfile {
  id: string;
  code: string;
  fullName: string;
  gender?: string | null;
  birthday?: string | null;
  phoneNumber?: string | null;
  unit?: string | null;
  rank?: string | null;
  User?: { id: string; username: string };
  user?: { id: string; username: string };
}
