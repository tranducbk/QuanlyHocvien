const db = require('../../models');
const { ForbiddenError, NotFoundError } = require('../../utils/apiError');

const getManagedStudentIds = async (requester) => {
  if (requester?.role !== 'COMMANDER' || requester.trainingSystemCode !== 'HE_5' || !requester.trainingSystemId) {
    throw new ForbiddenError('Chỉ Chỉ huy Hệ 5 được truy cập dữ liệu học tập này');
  }

  const students = await db.user.findAll({
    attributes: ['id'],
    where: { role: 'STUDENT', trainingSystemId: requester.trainingSystemId },
    include: [{
      model: db.profile,
      attributes: [],
      where: { commanderId: requester.id },
      required: true,
    }],
  });
  return students.map((student) => student.id);
};

const assertManagedStudent = async (requester, studentId) => {
  const studentIds = await getManagedStudentIds(requester);
  if (!studentIds.includes(studentId)) throw new NotFoundError('Không tìm thấy học viên trong phạm vi quản lý');
};

const getManagedSemesterResultIds = async (requester) => {
  const studentIds = await getManagedStudentIds(requester);
  if (!studentIds.length) return [];
  const semesters = await db.semesterResult.findAll({
    attributes: ['id'],
    where: { userId: { [db.Sequelize.Op.in]: studentIds } },
  });
  return semesters.map((semester) => semester.id);
};

module.exports = { getManagedStudentIds, assertManagedStudent, getManagedSemesterResultIds };
