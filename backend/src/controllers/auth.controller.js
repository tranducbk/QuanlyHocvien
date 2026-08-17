const asyncHandler = require('express-async-handler');
const Yup = require('yup');
const authService = require('../services/auth.service');
const db = require('../models');
const { success, paginated, validateOrThrow } = require('../utils/response');

const login = asyncHandler(async (req, res) => {
  const schema = Yup.object().shape({
    username: Yup.string().required('Tên đăng nhập là bắt buộc'),
    password: Yup.string().required('Mật khẩu là bắt buộc'),
  });
  await validateOrThrow(schema, req.body);

  const result = await authService.login(req.body.username, req.body.password);
  return success(res, result, 'Đăng nhập thành công');
});

const me = asyncHandler(async (req, res) => {
  const include = [];
  if (req.user.profileId) {
    include.push({
      model: db.profile,
      include: [{ model: db.class }, { model: db.organization }, { model: db.university }, { model: db.educationLevel }],
    });
  }
  const user = await db.user.findByPk(req.userId, { include });
  return success(res, user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'fullName', 'email', 'gender', 'birthday', 'hometown', 'ethnicity',
    'religion', 'currentAddress', 'placeOfBirth', 'phoneNumber', 'cccd',
    'partyMemberCardNumber', 'unit', 'rank', 'positionGovernment', 'positionParty',
    'fullPartyMember', 'probationaryPartyMember', 'dateOfEnlistment',
    'enrollment', 'graduationDate', 'currentCpa4', 'currentCpa10', 'familyMember',
    'foreignRelations', 'startWork', 'organization', 'classId', 'organizationId',
    'universityId', 'educationLevelId',
  ];

  const data = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }

  if (req.user.profileId) {
    const profile = await db.profile.findByPk(req.user.profileId);
    if (!profile) throw new (require('../utils/apiError').NotFoundError)('Không tìm thấy hồ sơ');
    await profile.update(data);
  } else {
    throw new (require('../utils/apiError').BadRequestError)('Không có hồ sơ để cập nhật');
  }

  return success(res, null, 'Cập nhật thông tin thành công');
});

// ===================== Notifications (chung cho mọi role) =====================

const getMyNotifications = asyncHandler(async (req, res) => {
  const where = { userId: req.userId };
  if (req.query.type) where.type = req.query.type;
  if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';
  const r = await require('../utils/response').paginateQuery(db.notification, req.query, { where });
  return paginated(res, r.rows, r.pagination);
});

const getMyNotificationDetail = asyncHandler(async (req, res) => {
  const n = await db.notification.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!n) throw new (require('../utils/apiError').NotFoundError)('Không tìm thấy thông báo');
  await n.update({ isRead: true });
  return success(res, n);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const n = await db.notification.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!n) throw new (require('../utils/apiError').NotFoundError)('Không tìm thấy thông báo');
  await n.update({ isRead: true });
  return success(res, null, 'Đã đánh dấu đọc');
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await db.notification.update({ isRead: true }, { where: { userId: req.userId } });
  return success(res, null, 'Đã đánh dấu đọc tất cả');
});

const deleteMyNotification = asyncHandler(async (req, res) => {
  const n = await db.notification.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!n) throw new (require('../utils/apiError').NotFoundError)('Không tìm thấy thông báo');
  await n.destroy();
  return success(res, null, 'Đã xóa thông báo');
});

const register = asyncHandler(async (req, res) => {
  const schema = Yup.object().shape({
    username: Yup.string().required().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
    password: Yup.string().required().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    role: Yup.string().oneOf(['STUDENT', 'COMMANDER', 'ADMIN']),
    fullName: Yup.string().max(100),
    email: Yup.string().max(100).email('Email không hợp lệ'),
    code: Yup.string().max(50),
  });
  await validateOrThrow(schema, req.body);

  const result = await authService.register(req.body);
  return success(res, result, 'Tạo tài khoản thành công', 201);
});

const refreshToken = asyncHandler(async (req, res) => {
  const schema = Yup.object().shape({
    refreshToken: Yup.string().required('Refresh token là bắt buộc'),
  });
  await validateOrThrow(schema, req.body);

  const result = await authService.refreshToken(req.body.refreshToken);
  return success(res, result, 'Làm mới token thành công');
});

const changePassword = asyncHandler(async (req, res) => {
  const schema = Yup.object().shape({
    oldPassword: Yup.string().required('Mật khẩu cũ là bắt buộc'),
    newPassword: Yup.string().required().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
  });
  await validateOrThrow(schema, req.body);

  await authService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
  return success(res, null, 'Đổi mật khẩu thành công');
});

module.exports = {
  login,
  me,
  updateProfile,
  register,
  refreshToken,
  changePassword,
  getMyNotifications,
  getMyNotificationDetail,
  markNotificationRead,
  markAllNotificationsRead,
  deleteMyNotification,
};
