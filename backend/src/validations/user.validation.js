const yup = require('yup');
const { RANKS } = require('../utils/constants');

const profileFields = {
  code: yup.string().max(50).nullable(),
  fullName: yup.string().max(100).nullable(),
  email: yup.string().max(100).email('Email không hợp lệ').nullable(),
  gender: yup.string().max(20).nullable(),
  birthday: yup.date().nullable(),
  hometown: yup.string().max(255).nullable(),
  ethnicity: yup.string().max(50).nullable(),
  religion: yup.string().max(50).nullable(),
  currentAddress: yup.string().max(255).nullable(),
  placeOfBirth: yup.string().max(255).nullable(),
  phoneNumber: yup.string().max(20).nullable(),
  cccd: yup.string().max(20).nullable(),
  partyMemberCardNumber: yup.string().max(50).nullable(),
  unit: yup.string().max(255).nullable(),
  rank: yup.string().oneOf(RANKS, 'Cấp bậc không hợp lệ').nullable(),
  positionGovernment: yup.string().max(100).nullable(),
  positionParty: yup.string().max(100).nullable(),
  fullPartyMember: yup.date().nullable(),
  probationaryPartyMember: yup.date().nullable(),
  dateOfEnlistment: yup.date().nullable(),
  enrollment: yup.number().integer().nullable(),
  graduationDate: yup.date().nullable(),
  currentCpa4: yup.number().nullable(),
  currentCpa10: yup.number().nullable(),
  familyMember: yup.mixed().nullable(),
  foreignRelations: yup.mixed().nullable(),
  startWork: yup.number().integer().nullable(),
  organization: yup.string().max(255).nullable(),
  classId: yup.string().max(36).nullable(),
  organizationId: yup.string().max(36).nullable(),
  universityId: yup.string().max(36).nullable(),
  educationLevelId: yup.string().max(36).nullable(),
  commanderId: yup.string().max(36).nullable(),
};

const create = yup.object({
  username: yup.string().max(50).required('Trường này là bắt buộc'),
  password: yup.string().max(255).required('Trường này là bắt buộc'),
  isAdmin: yup.boolean().nullable(),
  role: yup.string().max(50).oneOf(['STUDENT', 'COMMANDER', 'ADMIN'], 'Vai trò không hợp lệ').nullable(),
  refreshToken: yup.string().nullable(),
  deleteAt: yup.date().nullable(),
  ...profileFields,
});

const update = yup.object({
  username: yup.string().max(50).nullable(),
  password: yup.string().max(255).nullable(),
  isAdmin: yup.boolean().nullable(),
  role: yup.string().max(50).nullable(),
  refreshToken: yup.string().nullable(),
  deleteAt: yup.date().nullable(),
  code: yup.string().max(50).nullable(),
  fullName: yup.string().max(100).nullable(),
  email: yup.string().max(100).email('Email không hợp lệ').nullable(),
  gender: yup.string().max(20).nullable(),
  birthday: yup.date().nullable(),
  hometown: yup.string().max(255).nullable(),
  ethnicity: yup.string().max(50).nullable(),
  religion: yup.string().max(50).nullable(),
  currentAddress: yup.string().max(255).nullable(),
  placeOfBirth: yup.string().max(255).nullable(),
  phoneNumber: yup.string().max(20).nullable(),
  cccd: yup.string().max(20).nullable(),
  partyMemberCardNumber: yup.string().max(50).nullable(),
  unit: yup.string().max(255).nullable(),
  rank: yup.string().oneOf(RANKS, 'Cấp bậc không hợp lệ').nullable(),
  positionGovernment: yup.string().max(100).nullable(),
  positionParty: yup.string().max(100).nullable(),
  fullPartyMember: yup.date().nullable(),
  probationaryPartyMember: yup.date().nullable(),
  dateOfEnlistment: yup.date().nullable(),
  enrollment: yup.number().integer().nullable(),
  graduationDate: yup.date().nullable(),
  currentCpa4: yup.number().nullable(),
  currentCpa10: yup.number().nullable(),
  familyMember: yup.mixed().nullable(),
  foreignRelations: yup.mixed().nullable(),
  startWork: yup.number().integer().nullable(),
  organization: yup.string().max(255).nullable(),
  classId: yup.string().max(36).nullable(),
  organizationId: yup.string().max(36).nullable(),
  universityId: yup.string().max(36).nullable(),
  educationLevelId: yup.string().max(36).nullable(),
  commanderId: yup.string().max(36).nullable(),
});

const batch = yup.object({
  username: yup.string().max(50).required('Trường này là bắt buộc'),
  password: yup.string().max(255).nullable(),
  isAdmin: yup.boolean().nullable(),
  role: yup.string().max(50).nullable(),
  refreshToken: yup.string().nullable(),
  deleteAt: yup.date().nullable(),
  ...profileFields,
});

const batchProfileUpdate = yup.array().of(
  yup.object({
    code: yup.string().required('Trường này là bắt buộc'),
    fullName: yup.string().max(100).nullable(),
    email: yup.string().max(100).email('Email không hợp lệ').nullable(),
    gender: yup.string().max(20).nullable(),
    birthday: yup.date().nullable(),
    hometown: yup.string().max(255).nullable(),
    ethnicity: yup.string().max(50).nullable(),
    religion: yup.string().max(50).nullable(),
    currentAddress: yup.string().max(255).nullable(),
    placeOfBirth: yup.string().max(255).nullable(),
    phoneNumber: yup.string().max(20).nullable(),
    cccd: yup.string().max(20).nullable(),
    partyMemberCardNumber: yup.string().max(50).nullable(),
    unit: yup.string().max(255).nullable(),
    rank: yup.string().oneOf(RANKS, 'Cấp bậc không hợp lệ').nullable(),
    positionGovernment: yup.string().max(100).nullable(),
    positionParty: yup.string().max(100).nullable(),
    fullPartyMember: yup.date().nullable(),
    probationaryPartyMember: yup.date().nullable(),
    dateOfEnlistment: yup.date().nullable(),
    enrollment: yup.number().integer().nullable(),
    graduationDate: yup.date().nullable(),
    currentCpa4: yup.number().nullable(),
    currentCpa10: yup.number().nullable(),
    familyMember: yup.mixed().nullable(),
    foreignRelations: yup.mixed().nullable(),
    startWork: yup.number().integer().nullable(),
    organization: yup.string().max(255).nullable(),
    classId: yup.string().max(36).nullable(),
    organizationId: yup.string().max(36).nullable(),
    universityId: yup.string().max(36).nullable(),
    educationLevelId: yup.string().max(36).nullable(),
    commanderId: yup.string().max(100).nullable(),
  }),
);

const resetPassword = yup.object({
  newPassword: yup.string().min(6).required('Trường này là bắt buộc'),
});

const batchGraduation = yup.object({
  graduationDate: yup.date().nullable(),
  studentCodes: yup.array().of(yup.string().max(50).required('Mã học viên là bắt buộc')).min(1, 'Danh sách học viên không được rỗng').nullable(),
  students: yup.array().of(
    yup.object({
      code: yup.string().max(50).required('Mã học viên là bắt buộc'),
      graduationDate: yup.date().required('Ngày ra trường là bắt buộc'),
    }),
  ).min(1, 'Danh sách học viên không được rỗng').nullable(),
}).test('has-graduation-input', 'Cần truyền studentCodes + graduationDate hoặc students', (value) => {
  const hasStudentCodes = Array.isArray(value?.studentCodes) && value.studentCodes.length > 0 && value.graduationDate;
  const hasStudents = Array.isArray(value?.students) && value.students.length > 0;
  return Boolean(hasStudentCodes || hasStudents);
});

module.exports = { create, update, batch, batchProfileUpdate, batchGraduation, resetPassword };
