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

export interface TrainingProgramUniversity {
  id: string;
  universityCode: string;
  universityName: string;
  status?: string;
}

export interface TrainingProgramOrganization {
  id: string;
  organizationName: string;
  universityId?: string;
}

export interface TrainingProgramEducationLevel {
  id: string;
  levelName: string;
}

export interface TrainingProgram {
  id: string;
  trainingSystemId: string;
  universityId?: string | null;
  organizationId?: string | null;
  educationLevelId?: string | null;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  trainingSystem: TrainingSystemOption | null;
  university?: TrainingProgramUniversity | null;
  organization?: TrainingProgramOrganization | null;
  educationLevel?: TrainingProgramEducationLevel | null;
  versions: CurriculumVersion[];
}

export interface CreateTrainingProgram {
  code?: string;
  name?: string;
  description?: string;
  universityId?: string | null;
  organizationId?: string | null;
  educationLevelId?: string | null;
}

export interface UpdateTrainingProgram {
  code?: string;
  name?: string;
  description?: string | null;
  universityId?: string | null;
  organizationId?: string | null;
  educationLevelId?: string | null;
}

export interface CreateCurriculumVersion {
  versionCode?: string;
  name: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}
