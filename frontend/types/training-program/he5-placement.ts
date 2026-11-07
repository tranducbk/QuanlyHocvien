export interface PlacementYear {
  id: string;
  schoolYear: string;
  startYear: number;
  status: "DRAFT" | "CLOSED";
  previousYearId: string | null;
  closedAt: string | null;
}
export interface FixedClass { id: string; name: string; code: string; studentCount: number; universityCodes?: string[] }
export interface Placement {
  id: string;
  profileId: string;
  studentCode: string;
  fullName: string | null;
  trainingClassId: string;
  previousClassId: string | null;
  status: "ACTIVE" | "GRADUATED";
}
export interface PlacementDetail { year: PlacementYear; classes: FixedClass[]; placements: Placement[] }
export interface AvailableStudent { id: string; code: string; fullName: string | null }
