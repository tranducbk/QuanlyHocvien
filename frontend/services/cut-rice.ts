import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  CreateCutRiceRequest,
  CutRice,
  CutRiceRequest,
  CutRiceRequestQueryRequest,
  CutRiceQueryRequest,
  CreateCutRiceRequestPayload,
  ReviewCutRiceRequestPayload,
  UpdateCutRiceRequest,
} from "@/types/cut-rice";

export const cutRiceService = {
  getCutRiceList: async (
    params?: CutRiceQueryRequest
  ): Promise<PaginatedResponse<CutRice>> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.BASE, { params });
  },

  getCutRice: async (id: string): Promise<CutRice> => {
    return apiClient.get(`${ENDPOINTS.CUT_RICE.BASE}/${id}`);
  },

  getMyCutRice: async (
    params?: Pick<CutRiceQueryRequest, "semesterId" | "weekStartDate">
  ): Promise<ApiResponse<CutRice>> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.MY, { params });
  },

  getMyRequests: async (
    params?: CutRiceRequestQueryRequest
  ): Promise<PaginatedResponse<CutRiceRequest>> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.MY_REQUESTS, { params });
  },

  createMyRequest: async (data: CreateCutRiceRequestPayload) => {
    return apiClient.post(ENDPOINTS.CUT_RICE.MY_REQUESTS, data);
  },

  getRequests: async (
    params?: CutRiceRequestQueryRequest
  ): Promise<PaginatedResponse<CutRiceRequest>> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.REQUESTS, { params });
  },

  approveRequest: async (id: string, data?: ReviewCutRiceRequestPayload) => {
    return apiClient.post(ENDPOINTS.CUT_RICE.APPROVE_REQUEST(id), data || {});
  },

  rejectRequest: async (id: string, data?: ReviewCutRiceRequestPayload) => {
    return apiClient.post(ENDPOINTS.CUT_RICE.REJECT_REQUEST(id), data || {});
  },

  createCutRice: async (data: CreateCutRiceRequest) => {
    return apiClient.post(ENDPOINTS.CUT_RICE.BASE, data);
  },

  updateCutRice: async (id: string, data: UpdateCutRiceRequest) => {
    return apiClient.put(`${ENDPOINTS.CUT_RICE.BASE}/${id}`, data);
  },

  deleteCutRice: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.CUT_RICE.BASE}/${id}`);
  },

  generateForStudent: async (
    userId: string,
    semesterId?: string,
    weekStartDate?: string
  ) => {
    return apiClient.post(ENDPOINTS.CUT_RICE.GENERATE(userId), null, {
      params: {
        ...(semesterId ? { semesterId } : {}),
        ...(weekStartDate ? { weekStartDate } : {}),
      },
    });
  },

  generateAll: async () => {
    return apiClient.post(ENDPOINTS.CUT_RICE.GENERATE_ALL);
  },

  importExcel: async (file: File): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(ENDPOINTS.CUT_RICE.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.TEMPLATE, {
      responseType: "blob",
    });
  },

  exportExcel: async (params?: CutRiceQueryRequest): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.CUT_RICE.EXPORT, {
      params,
      responseType: "blob",
    });
  },
};
