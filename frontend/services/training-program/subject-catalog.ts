import apiClient from "../axios-client";
import { ENDPOINTS } from "@/constants/endpoints";

export type SubjectCatalogValues = { subjectCode: string; subjectName: string; credits: number };
export type CatalogSubject = SubjectCatalogValues & { id: string; trainingSystemId: string };

export const subjectCatalogService = {
  list: (): Promise<ApiResponse<CatalogSubject[]>> =>
    apiClient.get<unknown, ApiResponse<CatalogSubject[]>>(ENDPOINTS.TRAINING_CLASSES.SUBJECT_CATALOG),
  create: (data: SubjectCatalogValues): Promise<ApiResponse<CatalogSubject>> =>
    apiClient.post<unknown, ApiResponse<CatalogSubject>>(ENDPOINTS.TRAINING_CLASSES.SUBJECT_CATALOG, data),
  update: (id: string, data: SubjectCatalogValues): Promise<ApiResponse<CatalogSubject>> =>
    apiClient.put<unknown, ApiResponse<CatalogSubject>>(ENDPOINTS.TRAINING_CLASSES.SUBJECT_CATALOG_ITEM(id), data),
};
