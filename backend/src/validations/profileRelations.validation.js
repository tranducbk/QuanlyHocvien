const yup = require('yup');

const MAX_RELATION_RECORDS = 30;

const optionalText = (maxLength) => yup.string().trim().max(maxLength).nullable();

const familyMemberSchema = yup.object({
  relationship: yup.string().trim().max(50).required('Quan hệ gia đình là bắt buộc'),
  fullName: yup.string().trim().max(100).required('Họ tên thành viên là bắt buộc'),
  birthYear: yup.number().integer().min(1900).max(2100).nullable(),
  occupation: optionalText(150),
  workplace: optionalText(255),
  address: optionalText(255),
});

const foreignRelationSchema = yup.object({
  relationship: yup.string().trim().max(50).required('Mối quan hệ là bắt buộc'),
  fullName: yup.string().trim().max(100).required('Họ tên người liên quan là bắt buộc'),
  nationality: yup.string().trim().max(100).required('Quốc tịch là bắt buộc'),
  country: yup.string().trim().max(100).required('Quốc gia cư trú là bắt buộc'),
  occupation: optionalText(150),
  address: optionalText(255),
  notes: optionalText(500),
});

const familyMembers = yup
  .array()
  .of(familyMemberSchema)
  .max(MAX_RELATION_RECORDS, `Tối đa ${MAX_RELATION_RECORDS} thành viên gia đình`)
  .nullable();

const foreignRelations = yup
  .array()
  .of(foreignRelationSchema)
  .max(MAX_RELATION_RECORDS, `Tối đa ${MAX_RELATION_RECORDS} quan hệ nước ngoài`)
  .nullable();

module.exports = {
  familyMemberSchema,
  foreignRelationSchema,
  familyMembers,
  foreignRelations,
};
