const yup = require('yup');

const isoDate = yup.string().nullable().test('iso-date', 'Ngày phải có định dạng YYYY-MM-DD', (value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});

const createProgram = yup.object({
  trainingSystemId: yup.string().uuid().required(),
  code: yup.string().trim().max(50).required(),
  name: yup.string().trim().max(255).required(),
  description: yup.string().trim().nullable().max(2000),
}).noUnknown();

const createVersion = yup.object({
  versionCode: yup.string().trim().max(50).required(),
  name: yup.string().trim().max(255).required(),
  effectiveFrom: isoDate,
  effectiveTo: isoDate,
}).noUnknown();

const versionParams = yup.object({ id: yup.string().uuid().required() });

module.exports = { createProgram, createVersion, versionParams };
