export {};

declare global {
  interface ApiResponse<T = unknown> {
    statusCode: number;
    message: string;
    data?: T;
  }

  interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationInfo;
  }

  interface BatchMutationResult {
    total: number;
    created?: number;
    updated?: number;
    errors: number;
    results: Array<{
      id?: string;
      code?: string;
      studentCode?: string;
      status: "CREATED" | "UPDATED" | "ERROR";
      message?: string;
    }>;
  }

  interface QueryRequest {
    page?: number;
    limit?: number;
    fetchAll?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
}

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    /** Áp dụng white-space: nowrap cho cell */
    noWrap?: boolean;
  }
}
