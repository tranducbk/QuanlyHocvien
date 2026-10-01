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
