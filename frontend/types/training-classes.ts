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

export interface TrainingClassOptions {
  commanders: { id: string; trainingSystemId: string; name: string }[];
  providers: { id: string; name: string }[];
}

export interface CreateTrainingClass {
  trainingSystemId: string;
  code: string;
  name: string;
  commanderId?: string | null;
  educationProviderId?: string | null;
  trainingProgramId?: string | null;
  curriculumVersionId?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}
