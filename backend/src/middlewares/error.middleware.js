const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      type: err.type || 'ERROR',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, statusCode: 401, message: 'Token không hợp lệ', type: 'BAD_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, statusCode: 401, message: 'Token đã hết hạn', type: 'TOKEN_EXPIRED' });
  }

  const fieldNameMap = {
    username: 'Tên đăng nhập',
    email: 'Email',
    phone_number: 'Số điện thoại',
    code: 'Mã hồ sơ',
    student_id: 'Mã học viên',
    commander_id: 'Mã chỉ huy',
    university_code: 'Mã trường',
    class_code: 'Mã lớp',
    semester_code: 'Mã học kỳ',
    subject_code: 'Mã môn học',
  };

  const tableNameMap = {
    universities: 'Trường đại học',
    organizations: 'Đơn vị',
    education_levels: 'Trình độ đào tạo',
    classes: 'Lớp học',
    students: 'Học viên',
    commanders: 'Chỉ huy',
    users: 'Người dùng',
    profiles: 'Hồ sơ',
    yearly_results: 'Kết quả năm',
    semester_results: 'Kết quả học kỳ',
    subject_results: 'Kết quả môn học',
    yearly_achievements: 'Thành tích năm',
    scientific_initiatives: 'Sáng kiến',
    scientific_topics: 'Đề tài NCKH',
  };

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors?.map(e => fieldNameMap[e.path] || e.path).join(', ') || '';
    const msg = fields ? `${fields} đã tồn tại` : 'Dữ liệu trùng lặp';
    return res.status(400).json({ success: false, statusCode: 400, message: msg, type: 'DUPLICATE' });
  }

  // Sequelize foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const table = tableNameMap[err.table] || err.table || '';
    let msg = 'Tham chiếu không hợp lệ';
    if (req.method === 'DELETE') {
      msg = table ? `Không thể xóa vì ${table.toLowerCase()} đang có dữ liệu liên quan` : 'Không thể xóa vì đang có dữ liệu liên quan';
    } else {
      msg = table ? `Tham chiếu không hợp lệ: ${table} không tồn tại` : 'Tham chiếu không hợp lệ';
    }
    return res.status(400).json({ success: false, statusCode: 400, message: msg, type: 'FK_ERROR' });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.errors?.map(e => e.message).join(', ') || 'Lỗi xác thực dữ liệu',
      type: 'VALIDATION',
    });
  }

  return res.status(500).json({ success: false, statusCode: 500, message: 'Lỗi máy chủ nội bộ', type: 'SERVER_ERROR' });
};

module.exports = errorMiddleware;
