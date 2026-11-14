export interface MilitarySemester {
  id: string;
  code: number;
  schoolYear: string;
}

export interface MilitarySubject {
  id: string;
  classId: string;
  semesterId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  MilitarySemester?: MilitarySemester;
}

export interface MilitaryScheduleItem {
  subjectName: string;
  day: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  week?: number[];
}

export interface MilitaryTimeTable {
  id: string;
  classId: string;
  semesterId: string;
  schedules: MilitaryScheduleItem[];
  MilitarySemester?: MilitarySemester;
}

export interface MilitarySubjectResult {
  id: string;
  profileId: string;
  militarySubjectId: string;
  letterGrade: string;
  gradePoint4: number;
  gradePoint10: number;
  Profile?: { code: string; fullName: string };
  MilitarySubject?: MilitarySubject & { MilitarySemester?: MilitarySemester };
}

export interface MilitaryGradeProposal {
  id: string;
  profileId: string;
  userId: string;
  militarySubjectId: string;
  proposedLetterGrade: string;
  proposedGradePoint4: number;
  proposedGradePoint10: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
  Profile?: { code: string; fullName: string; User?: { username: string } };
  MilitarySubject?: MilitarySubject & { MilitarySemester?: MilitarySemester };
}

export interface MilitaryAchievement {
  id: string;
  classId: string;
  userId: string;
  category: "AWARD" | "SCIENTIFIC_TOPIC" | "SCIENTIFIC_INITIATIVE";
  title: string;
  award?: string | null;
  year?: number | null;
  schoolYear?: string | null;
  semester?: string | null;
  decisionNumber?: string | null;
  description?: string | null;
  User?: { Profile?: { code: string; fullName: string } };
}

export interface MilitaryDutySchedule {
  id: string;
  classId: string;
  userId: string;
  position: string;
  workDay: string;
  User?: {
    Profile?: {
      code: string;
      fullName: string;
      rank?: string;
      phoneNumber?: string;
    };
  };
}
