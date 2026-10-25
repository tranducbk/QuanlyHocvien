const Yup = require('yup');

exports.create = Yup.object({
  subjectResultId: Yup.string().uuid('Mã kết quả môn học không hợp lệ').required('Môn học là bắt buộc'),
  requestType: Yup.string().oneOf(['ADD', 'UPDATE', 'DELETE'], 'Loại đề xuất không hợp lệ').required('Loại đề xuất là bắt buộc'),
  reason: Yup.string().required('Lý do là bắt buộc'),
  proposedLetterGrade: Yup.string().max(5).nullable(),
  proposedGradePoint4: Yup.number().min(0).max(4).nullable(),
  proposedGradePoint10: Yup.number().min(0).max(10).nullable(),
  attachmentUrl: Yup.string().max(500).nullable(),
});

exports.approve = Yup.object({
  reviewNote: Yup.string().nullable(),
});

exports.reject = Yup.object({
  reviewNote: Yup.string().required('Lý do từ chối là bắt buộc'),
});
