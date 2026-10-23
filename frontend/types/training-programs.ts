export interface TrainingSystemOption {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CurriculumVersion {
  id: string;
  trainingProgramId: string;
  versionCode: string;
  name: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface TrainingProgram {
  id: string;
  trainingSystemId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  trainingSystem: TrainingSystemOption | null;
  versions: CurriculumVersion[];
}

export interface CreateTrainingProgram {
  trainingSystemId: string;
  code: string;
  name: string;
  description?: string;
}

export interface CreateCurriculumVersion {
  versionCode: string;
  name: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}
