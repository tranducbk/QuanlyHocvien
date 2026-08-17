import apiClient from "./axios-client";
import { ENDPOINTS } from "@/constants/endpoints";
import {
  CreateTuitionFeeRequest,
  TuitionFee,
  TuitionFeeQueryRequest,
  UpdateTuitionFeeRequest,
} from "@/types/tuition-fees";

const toAmount = (value: TuitionFee["totalAmount"]) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const matchesText = (source?: string | null, keyword?: string) => {
  if (!keyword) return true;
  return (source || "").toLowerCase().includes(keyword.toLowerCase());
};

const getSortValue = (item: TuitionFee, sortBy: string) => {
  if (sortBy === "totalAmount") return toAmount(item.totalAmount);
  if (sortBy === "updatedAt" || sortBy === "createdAt") {
    return new Date(item[sortBy]).getTime();
  }

  const value = item[sortBy as keyof TuitionFee];
  if (typeof value === "number") return value;
  if (typeof value === "string") return value.toLowerCase();
  return "";
};

const toPaginatedResponse = (
  items: TuitionFee[],
  params?: TuitionFeeQueryRequest
): PaginatedResponse<TuitionFee> => {
  const fetchAll = params?.fetchAll === true;
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || Math.max(items.length, 1));

  const filteredItems = items.filter((item) => {
    if (params?.status && item.status !== params.status) return false;
    if (!matchesText(item.schoolYear, params?.schoolYear)) return false;
    if (!matchesText(item.semester, params?.semester)) return false;
    if (!matchesText(item.userId || item.studentId, params?.studentId))
      return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!params?.sortBy) return 0;

    const first = getSortValue(a, params.sortBy);
    const second = getSortValue(b, params.sortBy);
    const direction = params.sortOrder === "desc" ? -1 : 1;

    if (first > second) return direction;
    if (first < second) return -direction;
    return 0;
  });

  const total = sortedItems.length;
  const data = fetchAll
    ? sortedItems
    : sortedItems.slice((page - 1) * limit, page * limit);
  const pageSize = fetchAll ? Math.max(total, 1) : limit;

  return {
    statusCode: 200,
    message: "Thành công",
    data,
    pagination: {
      total,
      page: fetchAll ? 1 : page,
      limit: pageSize,
      totalPages: fetchAll ? 1 : Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const tuitionFeeService = {
  getTuitionFees: async (
    params?: TuitionFeeQueryRequest
  ): Promise<PaginatedResponse<TuitionFee>> => {
    return apiClient.get(ENDPOINTS.TUITION_FEES.BASE, { params });
  },

  getMyTuitionFees: async (
    params?: TuitionFeeQueryRequest
  ): Promise<PaginatedResponse<TuitionFee>> => {
    const response = await apiClient.get<
      ApiResponse<TuitionFee[]>,
      ApiResponse<TuitionFee[]>
    >(ENDPOINTS.TUITION_FEES.MY, { params });

    return toPaginatedResponse(response.data || [], params);
  },

  createTuitionFee: async (data: CreateTuitionFeeRequest) => {
    return apiClient.post(ENDPOINTS.TUITION_FEES.BASE, data);
  },

  importTuitionFees: async (
    file: File
  ): Promise<ApiResponse<BatchMutationResult>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(ENDPOINTS.TUITION_FEES.IMPORT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.TUITION_FEES.TEMPLATE, {
      responseType: "blob",
    });
  },

  updateTuitionFee: async (id: string, data: UpdateTuitionFeeRequest) => {
    return apiClient.put(`${ENDPOINTS.TUITION_FEES.BASE}/${id}`, data);
  },

  deleteTuitionFee: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.TUITION_FEES.BASE}/${id}`);
  },

  exportTuitionReport: async (): Promise<Blob> => {
    return apiClient.get(ENDPOINTS.REPORTS.TUITION, {
      responseType: "blob",
    });
  },

  getHistories: async (id: string): Promise<ApiResponse<any[]>> => {
    return apiClient.get(`${ENDPOINTS.TUITION_FEES.BASE}/${id}/histories`);
  },
};
