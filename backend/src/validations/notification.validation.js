const Yup = require('yup');

exports.create = Yup.object({
  userId: Yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  title: Yup.string().max(255).required('Trường này là bắt buộc'),
  content: Yup.string().nullable(),
  type: Yup.string().max(50).nullable(),
  link: Yup.string().max(500).nullable(),
  isRead: Yup.boolean().nullable(),
});

// userId không được phép thay đổi (service bỏ qua nếu gửi lên)
exports.update = Yup.object({
  title: Yup.string().max(255).nullable(),
  content: Yup.string().nullable(),
  type: Yup.string().max(50).nullable(),
  link: Yup.string().max(500).nullable(),
  isRead: Yup.boolean().nullable(),
});
