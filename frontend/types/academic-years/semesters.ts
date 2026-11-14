export interface Semester {
  id: string;
  code: number;
  schoolYearId?: string | null;
  schoolYearInfo?: SchoolYear | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolYear {
  id: string;
  schoolYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterRequest {
  code: number;
  schoolYearId?: string | null;
  schoolYear?: string;
}

export interface CreateSchoolYearRequest {
  schoolYear: string;
}

export interface CreateTermRequest {
  schoolYearId?: string | null;
  schoolYear?: string;
  term: 1 | 2 | 3;
}

export interface UpdateSemesterRequest {
  code?: number;
  schoolYearId?: string | null;
  schoolYear?: string;
}

export interface SemesterQueryRequest extends QueryRequest {
  code?: number | string;
  schoolYearId?: string;
  schoolYear?: string;
}
