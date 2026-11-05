const yup = require('yup');

const isoDate = yup.string().nullable().test('iso-date', 'Ngày phải có định dạng YYYY-MM-DD', (value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});

const placementFields = {
  universityId: yup.string().uuid('Trường không hợp lệ').nullable(),
  organizationId: yup.string().uuid('Ngành không hợp lệ').nullable(),
  educationLevelId: yup.string().uuid('Trình độ không hợp lệ').nullable(),
};

const listProgramsQuery = yup.object({
  universityId: yup.string().uuid('Trường không hợp lệ'),
});

const createProgram = yup.object({
  code: yup.string().trim().max(50),
  name: yup.string().trim().max(255),
  description: yup.string().trim().nullable().max(2000),
  ...placementFields,
}).noUnknown();

const updateProgram = yup.object({
  code: yup.string().trim().min(1, 'Mã chương trình không được để trống').max(50),
  name: yup.string().trim().min(1, 'Tên chương trình không được để trống').max(255),
  description: yup.string().trim().nullable().max(2000),
  ...placementFields,
}).noUnknown().test('has-field', 'Cần cung cấp ít nhất một trường cần cập nhật', (value) =>
  Object.keys(value || {}).length > 0
);

const updateProgramStatus = yup.object({
  isActive: yup.boolean().required(),
}).noUnknown();

const createVersion = yup.object({
  versionCode: yup.string().trim().max(50),
  name: yup.string().trim().max(255).required('Tên khóa là bắt buộc'),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
}).noUnknown();

const versionParams = yup.object({ id: yup.string().uuid().required(), versionId: yup.string().uuid() });

module.exports = { listProgramsQuery, createProgram, updateProgram, updateProgramStatus, createVersion, versionParams };
