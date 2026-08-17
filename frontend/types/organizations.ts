/**
 * Đơn vị (Khoa/Phòng)
 */
export interface Organization {
  id: string;
  organizationName: string;
  travelTime: number;
  totalStudents: number;
  status: "ACTIVE" | "INACTIVE";
  universityId: string;
}

/**
 * Bậc đào tạo
 */
export interface EducationLevel {
  id: string;
  levelName: string;
}

/**
 * Tham số truy vấn đơn vị
 */
export interface OrganizationQueryRequest extends QueryRequest {
  universityId?: string;
}

/**
 * Tham số truy vấn bậc đào tạo
 */
export interface EducationLevelQueryRequest extends QueryRequest {
  organizationId?: string;
}

/**
 * Request tạo đơn vị
 */
export interface CreateOrganizationRequest {
  organizationName: string;
  travelTime: number;
  universityId: string;
  status?: "ACTIVE" | "INACTIVE";
}

/**
 * Request cập nhật đơn vị
 */
export interface UpdateOrganizationRequest {
  organizationName?: string;
  travelTime?: number;
  status?: "ACTIVE" | "INACTIVE";
}

/**
 * Request tạo bậc đào tạo
 */
export interface CreateEducationLevelRequest {
  levelName: string;
  organizationId: string;
}

/**
 * Request cập nhật bậc đào tạo
 */
export interface UpdateEducationLevelRequest {
  levelName?: string;
}
