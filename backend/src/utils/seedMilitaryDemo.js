require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../models');

const DEMO_PASSWORD = 'TestMil@12345';
const DEMO_ACCOUNTS = [
  { username: 'mil_admin_demo', role: 'ADMIN', systemType: null },
  { username: 'mil_cmd_demo', role: 'COMMANDER', systemType: 'MILITARY', profileCode: 'DEMO-MIL-CMD', fullName: 'Chỉ huy mẫu Nguyễn Văn A' },
  { username: 'mil_cmd2_demo', role: 'COMMANDER', systemType: 'MILITARY', profileCode: 'DEMO-MIL-CMD2', fullName: 'Chỉ huy mẫu Trần Văn B' },
  ...['Nguyễn Minh An', 'Trần Gia Bình', 'Lê Hoàng Cường', 'Phạm Đức Dũng', 'Võ Nhật Hào', 'Đỗ Quang Minh'].map((fullName, index) => ({
    username: `mil_hv_${String(index + 1).padStart(3, '0')}`,
    role: 'STUDENT',
    systemType: 'MILITARY',
    profileCode: `DEMO-MIL-HV${String(index + 1).padStart(3, '0')}`,
    fullName,
  })),
];

const ensureDemoUser = async (account, passwordHash, transaction) => {
  let profile = null;
  if (account.profileCode) {
    [profile] = await db.profile.findOrCreate({
      where: { code: account.profileCode },
      defaults: {
        code: account.profileCode,
        fullName: account.fullName,
        email: `${account.username}@example.invalid`,
        unit: 'Đơn vị thử nghiệm',
        rank: account.role === 'COMMANDER' ? 'Chỉ huy mẫu' : 'Học viên mẫu',
        gender: 'Nam',
        birthday: '2002-01-15',
        hometown: 'Tỉnh mẫu',
        ethnicity: 'Kinh',
        religion: 'Không',
        currentAddress: 'Địa chỉ dữ liệu mẫu',
        placeOfBirth: 'Địa điểm mẫu',
        dateOfEnlistment: '2022-09-01',
        enrollment: 2022,
        organization: 'Đơn vị thử nghiệm',
        familyMember: [{ relationship: 'Thân nhân mẫu', fullName: 'Người thân giả lập' }],
        foreignRelations: [],
      },
      transaction,
    });
  }

  const [user] = await db.user.findOrCreate({
    where: { username: account.username },
    defaults: {
      username: account.username,
      password: passwordHash,
      role: account.role,
      systemType: account.systemType,
      isAdmin: account.role === 'ADMIN',
      isActive: true,
      profileId: profile?.id || null,
    },
    transaction,
  });

  await user.update({
    password: passwordHash,
    role: account.role,
    systemType: account.systemType,
    isAdmin: account.role === 'ADMIN',
    isActive: true,
    profileId: profile?.id || null,
  }, { transaction });
  return { user, profile };
};

const ensureRecord = async (model, where, defaults, transaction) => {
  const [record] = await model.findOrCreate({ where, defaults, transaction });
  return record;
};

const seedMilitaryDemo = async () => {
  const queryInterface = db.sequelize.getQueryInterface();
  try {
    const usersColumns = await queryInterface.describeTable('users');
    const profileColumns = await queryInterface.describeTable('profiles');
    if (!usersColumns.system_type || !profileColumns.military_class_id) {
      throw new Error('Chưa có schema hệ quân sự. Hãy chạy npm run migrate:military-system trước.');
    }
    for (const table of [
      'military_classes',
      'military_semesters',
      'military_subjects',
      'military_time_tables',
      'military_subject_results',
      'military_grade_proposals',
      'military_achievements',
      'military_duty_schedules',
    ]) {
      await queryInterface.describeTable(table);
    }
  } catch (error) {
    await db.sequelize.close();
    throw error;
  }

  const transaction = await db.sequelize.transaction();
  try {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const accounts = {};
    for (const account of DEMO_ACCOUNTS) {
      accounts[account.username] = await ensureDemoUser(account, passwordHash, transaction);
    }

    const commanders = [accounts.mil_cmd_demo, accounts.mil_cmd2_demo];
    const classes = [];
    for (let index = 0; index < commanders.length; index += 1) {
      const commander = commanders[index];
      const classCode = `DEMO-MIL-${index === 0 ? 'A01' : 'B01'}`;
      const militaryClass = await ensureRecord(
        db.militaryClass,
        { classCode },
        { classCode, className: `Lớp quân sự mẫu ${index + 1}`, commanderId: commander.user.id },
        transaction,
      );
      await militaryClass.update({ commanderId: commander.user.id }, { transaction });
      classes.push(militaryClass);
    }

    const students = DEMO_ACCOUNTS.filter((account) => account.role === 'STUDENT').map(
      (account) => accounts[account.username],
    );
    for (let index = 0; index < students.length; index += 1) {
      const classIndex = index < 3 ? 0 : 1;
      await students[index].profile.update({
        militaryClassId: classes[classIndex].id,
        commanderId: commanders[classIndex].user.id,
      }, { transaction });
    }

    const semesters = [];
    const subjectsByClass = [];
    for (let index = 0; index < classes.length; index += 1) {
      const commanderId = commanders[index].user.id;
      const semester = await ensureRecord(
        db.militarySemester,
        { commanderId, schoolYear: '2026-2027', code: 1 },
        { commanderId, schoolYear: '2026-2027', code: 1 },
        transaction,
      );
      semesters.push(semester);
      const subjectRows = [];
      for (const [subjectIndex, subject] of [
        ['QS101', 'Điều lệnh mẫu'],
        ['QS102', 'Chiến thuật cơ sở mẫu'],
        ['QS103', 'Thể lực quân sự mẫu'],
      ].entries()) {
        subjectRows.push(await ensureRecord(
          db.militarySubject,
          { classId: classes[index].id, semesterId: semester.id, subjectCode: subject[0] },
          { classId: classes[index].id, semesterId: semester.id, subjectCode: subject[0], subjectName: subject[1], credits: subjectIndex + 2 },
          transaction,
        ));
      }
      subjectsByClass.push(subjectRows);
      const scheduleRows = [
        { subjectName: subjectRows[0].subjectName, day: 1, startTime: '07:30', endTime: '09:00', room: 'Sân mẫu 1', week: [1, 2, 3, 4] },
        { subjectName: subjectRows[1].subjectName, day: 3, startTime: '09:15', endTime: '10:45', room: 'Phòng mẫu 2', week: [1, 2, 3, 4] },
        { subjectName: subjectRows[2].subjectName, day: 5, startTime: '13:30', endTime: '15:00', room: 'Sân mẫu 3', week: [1, 2, 3, 4] },
      ];
      await ensureRecord(
        db.militaryTimeTable,
        { classId: classes[index].id, semesterId: semester.id },
        { classId: classes[index].id, semesterId: semester.id, schedules: scheduleRows },
        transaction,
      );
    }

    const resultRows = [
      { studentIndex: 0, subjectIndex: 0, letterGrade: 'B', gradePoint4: 3, gradePoint10: 8 },
      { studentIndex: 1, subjectIndex: 0, letterGrade: 'C', gradePoint4: 2, gradePoint10: 6.5 },
      { studentIndex: 3, subjectIndex: 0, letterGrade: 'A', gradePoint4: 4, gradePoint10: 9 },
    ];
    for (const result of resultRows) {
      const classIndex = result.studentIndex < 3 ? 0 : 1;
      const student = students[result.studentIndex];
      const subject = subjectsByClass[classIndex][result.subjectIndex];
      await ensureRecord(
        db.militarySubjectResult,
        { profileId: student.profile.id, militarySubjectId: subject.id },
        { profileId: student.profile.id, militarySubjectId: subject.id, enteredBy: commanders[classIndex].user.id, letterGrade: result.letterGrade, gradePoint4: result.gradePoint4, gradePoint10: result.gradePoint10 },
        transaction,
      );
    }

    const proposalRows = [
      { studentIndex: 1, status: 'PENDING', subjectIndex: 1, proposedLetterGrade: 'B', proposedGradePoint4: 3, proposedGradePoint10: 7.5 },
      { studentIndex: 2, status: 'REJECTED', subjectIndex: 1, proposedLetterGrade: 'A', proposedGradePoint4: 4, proposedGradePoint10: 9 },
      { studentIndex: 0, status: 'APPROVED', subjectIndex: 2, proposedLetterGrade: 'B', proposedGradePoint4: 3, proposedGradePoint10: 8 },
    ];
    for (const proposal of proposalRows) {
      const classIndex = proposal.studentIndex < 3 ? 0 : 1;
      const student = students[proposal.studentIndex];
      const subject = subjectsByClass[classIndex][proposal.subjectIndex];
      const record = await ensureRecord(
        db.militaryGradeProposal,
        { profileId: student.profile.id, militarySubjectId: subject.id, status: proposal.status },
        {
          profileId: student.profile.id,
          userId: student.user.id,
          militarySubjectId: subject.id,
          proposedLetterGrade: proposal.proposedLetterGrade,
          proposedGradePoint4: proposal.proposedGradePoint4,
          proposedGradePoint10: proposal.proposedGradePoint10,
          reason: 'Dữ liệu mẫu phục vụ kiểm thử hệ quân sự.',
          status: proposal.status,
          reviewerId: proposal.status === 'PENDING' ? null : commanders[classIndex].user.id,
          reviewNote: proposal.status === 'PENDING' ? null : `Kết quả duyệt mẫu: ${proposal.status}.`,
          reviewedAt: proposal.status === 'PENDING' ? null : new Date(),
        },
        transaction,
      );
      if (proposal.status === 'APPROVED') {
        await ensureRecord(
          db.militarySubjectResult,
          { profileId: student.profile.id, militarySubjectId: subject.id },
          { profileId: student.profile.id, militarySubjectId: subject.id, enteredBy: commanders[classIndex].user.id, letterGrade: record.proposedLetterGrade, gradePoint4: record.proposedGradePoint4, gradePoint10: record.proposedGradePoint10 },
          transaction,
        );
      }
    }

    const workDay = new Date();
    workDay.setDate(workDay.getDate() + 1);
    const workDayValue = workDay.toISOString().slice(0, 10);
    for (let index = 0; index < students.length; index += 1) {
      const classIndex = index < 3 ? 0 : 1;
      const student = students[index];
      await ensureRecord(
        db.militaryAchievement,
        { classId: classes[classIndex].id, userId: student.user.id, title: `Thành tích mẫu ${index + 1}` },
        { classId: classes[classIndex].id, userId: student.user.id, category: 'AWARD', title: `Thành tích mẫu ${index + 1}`, award: 'Khen thưởng kiểm thử', year: workDay.getFullYear(), schoolYear: '2026-2027', semester: '1', description: 'Bản ghi giả lập để kiểm tra chức năng thành tích.' },
        transaction,
      );
      await ensureRecord(
        db.militaryDutySchedule,
        { classId: classes[classIndex].id, userId: student.user.id, position: 'Trực ban mẫu', workDay: workDayValue },
        { classId: classes[classIndex].id, userId: student.user.id, position: 'Trực ban mẫu', workDay: workDayValue },
        transaction,
      );
      await ensureRecord(
        db.notification,
        { userId: student.user.id, title: 'Thông báo kiểm thử hệ quân sự' },
        { userId: student.user.id, title: 'Thông báo kiểm thử hệ quân sự', content: 'Đây là thông báo mẫu, không phải thông tin thật.', type: 'SYSTEM', isRead: false },
        transaction,
      );
    }

    await transaction.commit();
    console.log('Đã tạo/cập nhật dữ liệu demo hệ quân sự.');
    console.log(`Mật khẩu dùng chung: ${DEMO_PASSWORD}`);
    console.log('Admin: mil_admin_demo');
    console.log('Chỉ huy lớp A: mil_cmd_demo | Chỉ huy lớp B: mil_cmd2_demo');
    console.log('Học viên: mil_hv_001 đến mil_hv_006 (001-003 lớp A, 004-006 lớp B).');
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await db.sequelize.close();
  }
};

seedMilitaryDemo().catch((error) => {
  console.error('Không tạo được dữ liệu demo hệ quân sự:', error.message);
  process.exitCode = 1;
});
