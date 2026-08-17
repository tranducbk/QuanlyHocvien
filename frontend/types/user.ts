export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  isActive: boolean;
  role: "ADMIN" | "COMMANDER" | "STUDENT";
  refreshToken: string | null;
  profileId: string | null;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
}

export interface UserQueryRequest extends QueryRequest {
  username?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
}

export interface StudentProfileQueryRequest extends QueryRequest {
  code?: string;
  fullName?: string;
  gender?: "MALE" | "FEMALE" | "";
  unit?: string;
  rank?: string;
  classId?: string;
  organizationId?: string;
  universityId?: string;
  educationLevelId?: string;
  commanderId?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  code?: string;
  fullName?: string;
  email?: string | null;
  phoneNumber?: string | null;
  birthday?: string | null;
  cccd?: string | null;
  gender?: "MALE" | "FEMALE";
  hometown?: string | null;
  placeOfBirth?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  rank?: string | null;
  unit?: string | null;
  positionGovernment?: string | null;
  positionParty?: string | null;
  currentAddress?: string | null;
  dateOfEnlistment?: string | null;
  enrollment?: number | null;
  currentCpa4?: number | null;
  currentCpa10?: number | null;
  graduationDate?: string | null;
  partyMemberCardNumber?: string | null;
  probationaryPartyMember?: string | null;
  fullPartyMember?: string | null;
  familyMember?: string | null;
  foreignRelations?: string | null;
  startWork?: number | null;
  commanderId?: string | null;
}

export interface University {
  id: string;
  universityCode: string;
  universityName: string;
  totalStudents: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  className: string;
  studentCount: number;
  educationLevelId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  organizationName: string;
  travelTime: number;
  totalStudents: number;
  status: string;
  universityId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationLevel {
  id: string;
  levelName: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  user?: Pick<User, "id" | "username" | "role" | "isActive">;
  code: string;
  fullName: string;
  avatar: string | null;
  birthday: string;
  cccd: string;
  classId: string;
  createdAt: string;
  currentAddress: string;
  currentCpa4: number;
  currentCpa10: number;
  dateOfEnlistment: string;
  educationLevelId: string;
  email: string;
  enrollment: number;
  ethnicity: string;
  familyMember: string | null;
  foreignRelations: string | null;
  fullPartyMember: string | null;
  gender: "MALE" | "FEMALE";
  graduationDate: string | null;
  hometown: string;
  organizationId: string;
  partyMemberCardNumber: string | null;
  phoneNumber: string;
  placeOfBirth: string;
  positionGovernment: string;
  positionParty: string;
  probationaryPartyMember: string | null;
  rank: string;
  religion: string;
  unit: string;
  universityId: string;
  commanderId: string | null;
  updatedAt: string;
  university?: University;
  class?: Class;
  organization?: Organization;
  educationLevel?: EducationLevel;
  commander?: Pick<User, "id" | "username" | "role" | "isActive"> & {
    Profile?: { fullName: string };
    profile?: { fullName: string };
  };
  Commander?: Pick<User, "id" | "username" | "role" | "isActive"> & {
    Profile?: { fullName: string };
    profile?: { fullName: string };
  };
}

export interface Commander {
  id: string;
  code: string;
  fullName: string;
  avatar: string | null;
  birthday: string;
  cccd: string;
  currentAddress: string;
  email: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  rank: string;
  unit: string;
  positionGovernment: string;
  positionParty: string;
  startWork: number;
  hometown: string;
  placeOfBirth: string;
  ethnicity: string;
  religion: string;
  dateOfEnlistment: string | null;
  fullPartyMember: string | null;
  probationaryPartyMember: string | null;
  partyMemberCardNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailResponse extends User {
  profile: (Student & Commander) | null;
  Profile?: (Student & Commander) | null;
}
