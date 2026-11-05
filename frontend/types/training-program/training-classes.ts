export interface TrainingClass {
  id: string;
  trainingSystemId: string;
  trainingSystemCode: string | null;
  trainingSystemName: string | null;
  code: string;
  name: string;
  commanderId: string | null;
  commanderName: string | null;
  educationProviderId: string | null;
  educationProviderName: string | null;
  trainingProgramId: string | null;
  trainingProgramName: string | null;
  curriculumVersionId: string | null;
  curriculumVersionName: string | null;
  startYear: number | null;
  endYear: number | null;
  status: string;
}

export interface CreateTrainingClass {
  code?: string;
  name: string;
  educationProviderId?: string | null;
  trainingProgramId?: string | null;
  curriculumVersionId?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface UpdateTrainingClass {
  code?: string;
  name?: string;
  educationProviderId?: string | null;
  trainingProgramId?: string | null;
  curriculumVersionId?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}
