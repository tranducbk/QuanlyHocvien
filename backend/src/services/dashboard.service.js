const db = require('../models');

const User = db.user;
const Profile = db.profile;
const Class = db.class;
const Achievement = db.achievement;
const GradeRequest = db.gradeRequest;
const SubjectResult = db.subjectResult;
const TuitionFee = db.tuitionFee;
const YearlyResult = db.yearlyResult;
const TimeTable = db.timeTable;
const CutRice = db.cutRice;
const Notification = db.notification;

const toNumber = (value) => Number(value || 0);

const toChartRows = (rows, labelKey = 'label') => rows.map((row) => ({
  label: row[labelKey] || 'Chưa xác định',
  value: toNumber(row.value),
  amount: row.amount !== undefined ? toNumber(row.amount) : undefined,
}));

const getManagedProfileWhere = (requester) => (
  requester?.role === 'COMMANDER' ? { commanderId: requester.id } : {}
);

const getManagedUserInclude = (requester, extraProfileInclude = []) => ({
  model: Profile,
  where: getManagedProfileWhere(requester),
  required: requester?.role === 'COMMANDER',
  include: extraProfileInclude,
});

const groupCount = async (model, field, options = {}) => {
  const labelExpression = db.Sequelize.fn('COALESCE', db.Sequelize.cast(db.Sequelize.col(field), 'text'), 'Chưa xác định');
  const rows = await model.findAll({
    attributes: [
      [labelExpression, 'label'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col(`${model.name}.id`)), 'value'],
    ],
    group: [labelExpression],
    raw: true,
    ...options,
  });
  return toChartRows(rows);
};

const getStudentsByUnit = async (requester) => {
  const rows = await Profile.findAll({
    attributes: [
      [db.Sequelize.fn('COALESCE', db.Sequelize.col('unit'), 'Chưa phân đơn vị'), 'label'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('Profile.id')), 'value'],
    ],
    where: getManagedProfileWhere(requester),
    include: [{ model: User, attributes: [], where: { role: 'STUDENT' }, required: true }],
    group: [db.Sequelize.fn('COALESCE', db.Sequelize.col('unit'), 'Chưa phân đơn vị')],
    order: [[db.Sequelize.literal('value'), 'DESC']],
    limit: 6,
    raw: true,
  });
  return toChartRows(rows);
};

const getTuitionStatus = async (requester) => {
  const rows = await TuitionFee.findAll({
    attributes: [
      [db.Sequelize.fn('COALESCE', db.Sequelize.col('status'), 'UNKNOWN'), 'label'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('TuitionFee.id')), 'value'],
      [db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 'amount'],
    ],
    group: [db.Sequelize.fn('COALESCE', db.Sequelize.col('status'), 'UNKNOWN')],
    include: requester?.role === 'COMMANDER'
      ? [{ model: User, attributes: [], required: true, include: [getManagedUserInclude(requester)] }]
      : [],
    raw: true,
  });
  return toChartRows(rows).map((item) => ({
    ...item,
    label: item.label === 'PAID' ? 'Đã nộp' : item.label === 'UNPAID' ? 'Chưa nộp' : item.label,
  }));
};

const getAchievementsByYear = async (requester) => {
  const rows = await Achievement.findAll({
    attributes: [
      [db.Sequelize.fn('COALESCE', db.Sequelize.cast(db.Sequelize.col('year'), 'text'), 'Chưa xác định'), 'label'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('Achievement.id')), 'value'],
    ],
    group: [db.Sequelize.fn('COALESCE', db.Sequelize.cast(db.Sequelize.col('year'), 'text'), 'Chưa xác định')],
    include: requester?.role === 'COMMANDER'
      ? [{ model: User, attributes: [], required: true, include: [getManagedUserInclude(requester)] }]
      : [],
    order: [[db.Sequelize.literal('label'), 'ASC']],
    raw: true,
  });
  return toChartRows(rows);
};

const getRecentStudents = async (requester) => {
  const users = await User.findAll({
    where: { role: 'STUDENT' },
    include: [getManagedUserInclude(requester, [{ model: Class }])],
    order: [['updatedAt', 'DESC']],
    limit: 5,
  });

  return users.map((user) => {
    const plain = user.get({ plain: true });
    return {
      id: plain.id,
      code: plain.Profile?.code || '',
      fullName: plain.Profile?.fullName || plain.username,
      className: plain.Profile?.Class?.className || '',
      unit: plain.Profile?.unit || '',
      updatedAt: plain.updatedAt,
    };
  });
};

const getPendingRequests = async (requester) => {
  const requests = await GradeRequest.findAll({
    where: { status: 'PENDING' },
    include: [
      { model: User, required: requester?.role === 'COMMANDER', include: [getManagedUserInclude(requester)] },
      { model: SubjectResult },
    ],
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  return requests.map((request) => {
    const plain = request.get({ plain: true });
    return {
      id: plain.id,
      studentName: plain.User?.Profile?.fullName || plain.User?.username || 'Chưa có tên học viên',
      subjectName: plain.SubjectResult?.subjectName || 'Kết quả học tập',
      status: plain.status,
      createdAt: plain.createdAt,
    };
  });
};

const getUnpaidTuition = async (requester) => {
  const records = await TuitionFee.findAll({
    where: { status: 'UNPAID' },
    include: [
      { model: User, required: requester?.role === 'COMMANDER', include: [getManagedUserInclude(requester)] },
      { model: db.semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] },
    ],
    order: [['updatedAt', 'DESC']],
    limit: 5,
  });

  return records.map((record) => {
    const plain = record.get({ plain: true });
    return {
      id: plain.id,
      studentName: plain.User?.Profile?.fullName || plain.User?.username || 'Chưa có tên học viên',
      amount: toNumber(plain.totalAmount),
      semester: plain.semesterInfo?.code || plain.semester || '',
      schoolYear: plain.semesterInfo?.schoolYearInfo?.schoolYear || plain.schoolYear || '',
      updatedAt: plain.updatedAt,
    };
  });
};

const getRiskStudents = async (requester) => {
  const users = await User.findAll({
    where: { role: 'STUDENT' },
    include: [
      getManagedUserInclude(requester),
      { model: YearlyResult, required: false },
      { model: TuitionFee, where: { status: 'UNPAID' }, required: false },
    ],
    order: [['updatedAt', 'DESC']],
  });

  const risks = [];
  for (const user of users) {
    const plain = user.get({ plain: true });
    const yearlyResults = plain.YearlyResults || [];
    const latestResult = yearlyResults.sort((a, b) => String(b.schoolYear || '').localeCompare(String(a.schoolYear || '')))[0];
    const unpaidCount = (plain.TuitionFees || []).length;
    const reasons = [];

    if (latestResult?.cumulativeGrade4 !== null && latestResult?.cumulativeGrade4 !== undefined && Number(latestResult.cumulativeGrade4) < 2) {
      reasons.push('CPA thấp');
    }
    if (Number(latestResult?.failedSubjects || 0) > 0) reasons.push('Có môn trượt');
    if (Number(latestResult?.debtCredits || 0) > 0) reasons.push('Nợ tín chỉ');
    if (unpaidCount > 0) reasons.push('Chưa nộp học phí');

    if (reasons.length) {
      risks.push({
        id: plain.id,
        code: plain.Profile?.code || '',
        fullName: plain.Profile?.fullName || plain.username,
        cpa4: latestResult?.cumulativeGrade4 ?? latestResult?.averageGrade4 ?? null,
        failedSubjects: Number(latestResult?.failedSubjects || 0),
        unpaidCount,
        reasons,
      });
    }
  }

  return risks.slice(0, 5);
};

const getCommanderDashboard = async () => {
  const [
    totalStudents,
    totalClasses,
    totalAchievements,
    pendingGradeRequests,
    unpaidTuitionRecords,
    academicStatus,
    gradeRequests,
    tuitionStatus,
    studentsByUnit,
    achievementsByYear,
    recentStudents,
    pendingRequests,
    unpaidTuition,
    riskStudents,
  ] = await Promise.all([
    User.count({ where: { role: 'STUDENT' } }),
    Class.count(),
    Achievement.count(),
    GradeRequest.count({ where: { status: 'PENDING' } }),
    TuitionFee.count({ where: { status: 'UNPAID' } }),
    groupCount(YearlyResult, 'academic_status'),
    groupCount(GradeRequest, 'status'),
    getTuitionStatus(),
    getStudentsByUnit(),
    getAchievementsByYear(),
    getRecentStudents(),
    getPendingRequests(),
    getUnpaidTuition(),
    getRiskStudents(),
  ]);

  return {
    overview: {
      totalStudents,
      totalClasses,
      pendingGradeRequests,
      unpaidTuitionRecords,
      totalAchievements,
      atRiskStudents: riskStudents.length,
    },
    charts: {
      academicStatus,
      gradeRequests,
      tuitionStatus,
      studentsByUnit,
      achievementsByYear,
    },
    alerts: {
      riskStudents,
      unpaidTuition,
      pendingRequests,
    },
    recent: {
      students: recentStudents,
    },
  };
};

const getAdminDashboard = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalStudents,
    totalCommanders,
    totalAdmins,
    totalUniversities,
    totalOrganizations,
    totalClasses,
    totalNotifications,
    pendingGradeRequests,
    usersWithoutProfile,
    recentUsers,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { isActive: true } }),
    User.count({ where: { isActive: false } }),
    User.count({ where: { role: 'STUDENT' } }),
    User.count({ where: { role: 'COMMANDER' } }),
    User.count({ where: { role: 'ADMIN' } }),
    db.university.count(),
    db.organization.count(),
    Class.count(),
    Notification.count(),
    GradeRequest.count({ where: { status: 'PENDING' } }),
    User.count({ where: { role: ['STUDENT', 'COMMANDER'], profileId: null } }),
    User.findAll({
      include: [{ model: Profile }],
      order: [['createdAt', 'DESC']],
      limit: 6,
      attributes: { exclude: ['password', 'refreshToken'] },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalStudents,
      totalCommanders,
      totalAdmins,
      totalUniversities,
      totalOrganizations,
      totalClasses,
      totalNotifications,
      pendingGradeRequests,
      usersWithoutProfile,
    },
    charts: {
      usersByRole: [
        { label: 'Học viên', value: totalStudents },
        { label: 'Chỉ huy', value: totalCommanders },
        { label: 'Quản trị', value: totalAdmins },
      ],
      userStatus: [
        { label: 'Đang hoạt động', value: activeUsers },
        { label: 'Đã khóa', value: inactiveUsers },
      ],
      masterData: [
        { label: 'Trường', value: totalUniversities },
        { label: 'Đơn vị/Khoa', value: totalOrganizations },
        { label: 'Lớp', value: totalClasses },
      ],
      recordsByModule: [
        { label: 'Kết quả năm', value: await YearlyResult.count() },
        { label: 'Học phí', value: await TuitionFee.count() },
        { label: 'Thành tích', value: await Achievement.count() },
        { label: 'Thông báo', value: totalNotifications },
      ],
    },
    alerts: {
      pendingGradeRequests,
      inactiveUsers,
      usersWithoutProfile,
    },
    recent: {
      users: recentUsers.map((user) => {
        const plain = user.get({ plain: true });
        return {
          id: plain.id,
          username: plain.username,
          role: plain.role,
          isActive: plain.isActive,
          fullName: plain.Profile?.fullName || '',
          code: plain.Profile?.code || '',
          createdAt: plain.createdAt,
        };
      }),
    },
  };
};

const getCutMealCount = (record) => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const slots = ['morning', 'noon', 'evening'];
  const weekly = record?.weekly || {};
  return days.reduce((total, day) => {
    const slot = weekly[day] || weekly[day.toLowerCase()] || {};
    return total + slots.reduce((sum, meal) => sum + Number(Boolean(slot[meal])), 0);
  }, 0);
};

const getStudentDashboard = async (userId) => {
  const [
    user,
    yearlyResults,
    tuitionFees,
    timeTables,
    cutRice,
    notifications,
    unreadNotifications,
    pendingGradeRequests,
  ] = await Promise.all([
    User.findByPk(userId, {
      include: [{ model: Profile, include: [{ model: Class }] }],
      attributes: { exclude: ['password', 'refreshToken'] },
    }),
    YearlyResult.findAll({ where: { userId }, order: [['schoolYear', 'DESC']] }),
    TuitionFee.findAll({
      where: { userId },
      include: [{ model: db.semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] }],
      order: [['updatedAt', 'DESC']],
    }),
    TimeTable.findAll({ where: { userId }, order: [['updatedAt', 'DESC']] }),
    CutRice.findOne({ where: { userId }, order: [['weekStartDate', 'DESC'], ['updatedAt', 'DESC']] }),
    Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 5 }),
    Notification.count({ where: { userId, isRead: false } }),
    GradeRequest.count({ where: { userId, status: 'PENDING' } }),
  ]);

  const latestAcademic = yearlyResults[0];
  const schedules = timeTables.flatMap((item) => item.schedules || []);
  const unpaidTuition = tuitionFees.filter((fee) => fee.status === 'UNPAID');
  const unpaidAmount = unpaidTuition.reduce((sum, fee) => sum + toNumber(fee.totalAmount), 0);

  return {
    profile: user ? {
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      fullName: user.Profile?.fullName || '',
      code: user.Profile?.code || '',
      className: user.Profile?.Class?.className || '',
      unit: user.Profile?.unit || '',
    } : null,
    overview: {
      cpa4: latestAcademic?.cumulativeGrade4 ?? latestAcademic?.averageGrade4 ?? user?.Profile?.currentCpa4 ?? null,
      credits: latestAcademic?.cumulativeCredits ?? latestAcademic?.totalCredits ?? 0,
      passedSubjects: yearlyResults.reduce((sum, row) => sum + toNumber(row.passedSubjects), 0),
      failedSubjects: yearlyResults.reduce((sum, row) => sum + toNumber(row.failedSubjects), 0),
      scheduleCount: schedules.length,
      cutMealCount: getCutMealCount(cutRice),
      unpaidTuitionCount: unpaidTuition.length,
      unpaidTuitionAmount: unpaidAmount,
      unreadNotifications,
      pendingGradeRequests,
    },
    charts: {
      academicTrend: yearlyResults.slice().reverse().map((row) => ({
        label: row.schoolYear,
        value: toNumber(row.cumulativeGrade4 ?? row.averageGrade4),
      })),
      subjectStatus: [
        { label: 'Đã đạt', value: yearlyResults.reduce((sum, row) => sum + toNumber(row.passedSubjects), 0) },
        { label: 'Chưa đạt', value: yearlyResults.reduce((sum, row) => sum + toNumber(row.failedSubjects), 0) },
      ],
      tuitionStatus: [
        { label: 'Đã nộp', value: tuitionFees.filter((fee) => fee.status === 'PAID').length },
        { label: 'Chưa nộp', value: unpaidTuition.length },
      ],
    },
    recent: {
      schedules: schedules.slice(0, 6),
      tuition: tuitionFees.slice(0, 5).map((fee) => {
        const plain = fee.get({ plain: true });
        return {
          id: plain.id,
          amount: toNumber(plain.totalAmount),
          status: plain.status,
          semester: plain.semesterInfo?.code || plain.semester || '',
          schoolYear: plain.semesterInfo?.schoolYearInfo?.schoolYear || plain.schoolYear || '',
          updatedAt: plain.updatedAt,
        };
      }),
      notifications: notifications.map((item) => item.get({ plain: true })),
    },
  };
};

module.exports = { getAdminDashboard, getCommanderDashboard, getStudentDashboard };
