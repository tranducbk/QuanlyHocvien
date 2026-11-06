const yup = require('yup');

const MIN_YEAR = 1945;
const MAX_YEAR = 2100;
const courseYear = (label) => yup.number()
  .integer(`${label} phải là năm hợp lệ`)
  .min(MIN_YEAR, `${label} không được trước năm ${MIN_YEAR}`)
  .max(MAX_YEAR, `${label} không được sau năm ${MAX_YEAR}`)
  .required(`${label} là bắt buộc`);

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
  startYear: courseYear('Năm bắt đầu khóa học'),
  endYear: courseYear('Năm kết thúc khóa học'),
}).noUnknown().test(
  'date-order',
  'Năm kết thúc phải sau năm bắt đầu',
  (value) => !value?.startYear || !value?.endYear || value.endYear > value.startYear,
);

const updateVersion = yup.object({
  name: yup.string().trim().min(1, 'Tên khóa không được để trống').max(255).required('Tên khóa là bắt buộc'),
  startYear: courseYear('Năm bắt đầu khóa học'),
  endYear: courseYear('Năm kết thúc khóa học'),
}).noUnknown().test(
  'date-order',
  'Năm kết thúc phải sau năm bắt đầu',
  (value) => !value?.startYear || !value?.endYear || value.endYear > value.startYear,
);

const versionParams = yup.object({ id: yup.string().uuid().required(), versionId: yup.string().uuid() });

module.exports = { listProgramsQuery, createProgram, updateProgram, updateProgramStatus, createVersion, updateVersion, versionParams };
