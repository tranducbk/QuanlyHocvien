import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  Organization,
  EducationLevel,
  OrganizationQueryRequest,
  EducationLevelQueryRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateEducationLevelRequest,
  UpdateEducationLevelRequest,
} from "@/types/organizations";

export const organizationService = {
  // Organization
  getOrganizations: async (
    params?: OrganizationQueryRequest
  ): Promise<PaginatedResponse<Organization>> => {
    return apiClient.get(ENDPOINTS.ORGANIZATIONS.BASE, { params });
  },

  getOrganization: async (
    id: string
  ): Promise<ApiResponse<Organization>> => {
    return apiClient.get(`${ENDPOINTS.ORGANIZATIONS.BASE}/${id}`);
  },

  createOrganization: async (
    data: CreateOrganizationRequest
  ) => {
    return apiClient.post(ENDPOINTS.ORGANIZATIONS.BASE, data);
  },

  updateOrganization: async (
    id: string,
    data: UpdateOrganizationRequest
  ) => {
    return apiClient.put(
      `${ENDPOINTS.ORGANIZATIONS.BASE}/${id}`,
      data
    );
  },

  toggleOrganizationStatus: async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE"
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    return apiClient.put(`${ENDPOINTS.ORGANIZATIONS.BASE}/${id}`, {
      status: newStatus,
    });
  },

  deleteOrganization: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.ORGANIZATIONS.BASE}/${id}`);
  },

  // Education Level
  getEducationLevels: async (
    params?: EducationLevelQueryRequest
  ): Promise<PaginatedResponse<EducationLevel>> => {
    return apiClient.get(ENDPOINTS.EDUCATION_LEVELS.BASE, { params });
  },

  getEducationLevel: async (
    id: string
  ): Promise<ApiResponse<EducationLevel>> => {
    return apiClient.get(`${ENDPOINTS.EDUCATION_LEVELS.BASE}/${id}`);
  },

  createEducationLevel: async (
    data: CreateEducationLevelRequest
  ) => {
    return apiClient.post(ENDPOINTS.EDUCATION_LEVELS.BASE, data);
  },

  updateEducationLevel: async (
    id: string,
    data: UpdateEducationLevelRequest
  ) => {
    return apiClient.put(
      `${ENDPOINTS.EDUCATION_LEVELS.BASE}/${id}`,
      data
    );
  },

  deleteEducationLevel: async (id: string) => {
    return apiClient.delete(
      `${ENDPOINTS.EDUCATION_LEVELS.BASE}/${id}`
    );
  },
};
