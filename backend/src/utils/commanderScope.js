const db = require('../models');
const { ForbiddenError, NotFoundError } = require('./apiError');

const User = db.user;

// Quy tắc phạm vi: chỉ huy được quản lý mọi học viên cùng hệ (systemType) với mình
const isCommander = (requester) => requester?.role === 'COMMANDER';

const isStudentInScope = (requester, user) => {
  if (!isCommander(requester)) return true;
  return user?.role === 'STUDENT' && user.systemType === requester.systemType;
};

const assertStudentInScope = (requester, user, message = 'Không có quyền thao tác với học viên này') => {
  if (!isStudentInScope(requester, user)) throw new ForbiddenError(message);
};

// Kiểm tra theo userId; trả về user nếu hợp lệ
const assertStudentIdInScope = async (requester, userId) => {
  if (!isCommander(requester)) return null;
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('Không tìm thấy học viên');
  assertStudentInScope(requester, user);
  return user;
};

// Điều kiện where cho include User khi chỉ huy truy vấn dữ liệu học viên
const studentUserWhere = (requester) => (
  isCommander(requester) ? { role: 'STUDENT', systemType: requester.systemType } : undefined
);

// Include User an toàn (không kèm password/refreshToken), lọc theo phạm vi chỉ huy
const scopedUserInclude = (requester, extra = {}) => {
  const where = studentUserWhere(requester);
  return {
    model: User,
    attributes: { exclude: ['password', 'refreshToken'] },
    ...(where ? { where, required: true } : {}),
    ...extra,
  };
};

module.exports = {
  isCommander,
  isStudentInScope,
  assertStudentInScope,
  assertStudentIdInScope,
  studentUserWhere,
  scopedUserInclude,
};
