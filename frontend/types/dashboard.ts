export interface DashboardChartItem {
  label: string;
  value: number;
  amount?: number;
}

export interface DashboardRiskStudent {
  id: string;
  code: string;
  fullName: string;
  cpa4: number | null;
  failedSubjects: number;
  unpaidCount: number;
  reasons: string[];
}

export interface DashboardTuitionAlert {
  id: string;
  studentName: string;
  amount: number;
  semester: string | number;
  schoolYear: string;
  updatedAt: string;
}

export interface DashboardGradeRequestAlert {
  id: string;
  studentName: string;
  subjectName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface DashboardRecentStudent {
  id: string;
  code: string;
  fullName: string;
  className: string;
  unit: string;
  updatedAt: string;
}

export interface CommanderDashboard {
  overview: {
    totalStudents: number;
    totalClasses: number;
    pendingGradeRequests: number;
    unpaidTuitionRecords: number;
    totalAchievements: number;
    atRiskStudents: number;
  };
  charts: {
    academicStatus: DashboardChartItem[];
    gradeRequests: DashboardChartItem[];
    tuitionStatus: DashboardChartItem[];
    studentsByUnit: DashboardChartItem[];
    achievementsByYear: DashboardChartItem[];
  };
  alerts: {
    riskStudents: DashboardRiskStudent[];
    unpaidTuition: DashboardTuitionAlert[];
    pendingRequests: DashboardGradeRequestAlert[];
  };
  recent: {
    students: DashboardRecentStudent[];
  };
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalStudents: number;
    totalCommanders: number;
    totalAdmins: number;
    totalUniversities: number;
    totalOrganizations: number;
    totalClasses: number;
    totalNotifications: number;
    pendingGradeRequests: number;
    usersWithoutProfile: number;
  };
  charts: {
    usersByRole: DashboardChartItem[];
    userStatus: DashboardChartItem[];
    masterData: DashboardChartItem[];
    recordsByModule: DashboardChartItem[];
  };
  alerts: {
    pendingGradeRequests: number;
    inactiveUsers: number;
    usersWithoutProfile: number;
  };
  recent: {
    users: Array<{
      id: string;
      username: string;
      role: "ADMIN" | "COMMANDER" | "STUDENT";
      isActive: boolean;
      fullName: string;
      code: string;
      createdAt: string;
    }>;
  };
}

export interface StudentDashboard {
  profile: {
    id: string;
    username: string;
    isActive: boolean;
    fullName: string;
    code: string;
    className: string;
    unit: string;
  } | null;
  overview: {
    cpa4: number | null;
    credits: number;
    passedSubjects: number;
    failedSubjects: number;
    scheduleCount: number;
    cutMealCount: number;
    unpaidTuitionCount: number;
    unpaidTuitionAmount: number;
    unreadNotifications: number;
    pendingGradeRequests: number;
  };
  charts: {
    academicTrend: DashboardChartItem[];
    subjectStatus: DashboardChartItem[];
    tuitionStatus: DashboardChartItem[];
  };
  recent: {
    schedules: Array<{
      day?: string;
      startTime?: string;
      endTime?: string;
      room?: string;
      subjectName?: string;
      week?: number;
    }>;
    tuition: Array<{
      id: string;
      amount: number;
      status: "PAID" | "UNPAID";
      semester: string | number;
      schoolYear: string;
      updatedAt: string;
    }>;
    notifications: Array<{
      id: string;
      title: string;
      content?: string | null;
      isRead: boolean;
      createdAt: string;
    }>;
  };
}
