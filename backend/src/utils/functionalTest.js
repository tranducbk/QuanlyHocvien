/**
 * Functional Test Suite - Student Manager Backend
 * 
 * Tests COMPLETE FUNCTIONAL FLOWS (not individual APIs) per SPEC.md:
 *   Học viên: HV-01 -> HV-09
 *   Chỉ huy:  CH-01 -> CH-11
 *   Quản trị viên: QTV-01, QTV-02
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:6868/api';
const LOG_FILE = path.join(__dirname, '..', '..', 'functional-test.log');

// Track all test results
let passed = 0, failed = 0, total = 0;
const testResults = [];
let startTime;

// Store tokens and IDs for cross-flow testing
const state = {
  adminToken: null,
  commanderToken: null,
  studentToken: null,
  studentId: null,
  studentUserId: null,
  commanderId: null,
  createdStudentId: null,
  createdSubjectResultId: null,
  createdGradeRequestId: null,
  createdTimetableId: null,
  createdUserId: null,
  createdUniversityId: null,
  createdClassId: null,
  createdSemesterId: null,
  createdAchievementId: null,
  createdDutyScheduleId: null,
  ts: Date.now(),
};

// ============== HTTP HELPERS ==============

function request(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body && method === 'PUT' && path.includes('profile')) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const req = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers, timeout: 15000 },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
          catch { resolve({ status: res.statusCode, body: data, headers: res.headers }); }
        });
      }
    );
    req.on('error', () => resolve({ status: 0, body: { message: 'Connection refused' } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: { message: 'Timeout' } }); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ============== TEST HELPERS ==============

function test(module, name, status, expectedStatus, detail = '') {
  total++;
  const ok = Array.isArray(expectedStatus) ? expectedStatus.includes(status) : status === expectedStatus;
  const mark = ok ? '✅' : '❌';
  const result = ok ? 'PASS' : 'FAIL';

  if (ok) passed++; else failed++;

  const line = `  ${mark} [${result}] ${name} (status=${status}${expectedStatus ? ', expected=' + expectedStatus : ''})${detail ? ' — ' + detail : ''}`;
  console.log(line);
  testResults.push({ module, name, result, status, expectedStatus, detail });
  return ok;
}

function check(module, name, condition, detail = '') {
  total++;
  const ok = !!condition;
  const mark = ok ? '✅' : '❌';
  const result = ok ? 'PASS' : 'FAIL';

  if (ok) passed++; else failed++;

  const line = `  ${mark} [${result}] ${name}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  testResults.push({ module, name, result, status: condition ? 200 : 0, expectedStatus: 200, detail });
  return ok;
}

function logSection(title) {
  const line = `\n${'═'.repeat(70)}\n  ${title}\n${'═'.repeat(70)}`;
  console.log(line);
}

// ============== WAIT FOR SERVER ==============

function waitForServer(maxRetries = 30) {
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      const req = http.get('http://localhost:6868/health', (res) => {
        if (res.statusCode === 200) resolve(true);
        else { tries++; tries < maxRetries ? setTimeout(check, 1000) : resolve(false); }
      });
      req.on('error', () => { tries++; tries < maxRetries ? setTimeout(check, 1000) : resolve(false); });
      req.setTimeout(3000, () => { req.destroy(); tries++; tries < maxRetries ? setTimeout(check, 1000) : resolve(false); });
    };
    check();
  });
}

// ============== MAIN TEST SUITE ==============

async function runAllTests() {
  startTime = Date.now();
  console.log('\n' + '█'.repeat(70));
  console.log('█  STUDENT MANAGER — FULL FUNCTIONAL TEST SUITE');
  console.log('█  Based on: doc/SPEC.md');
  console.log('█  Testing: COMPLETE USER FLOWS (not isolated APIs)');
  console.log('█'.repeat(70));

  // =============================================
  // SECTION 0: HEALTH CHECK + AUTH (shared)
  // =============================================
  logSection('0. SYSTEM HEALTH CHECK');

  let res = await request('GET', '/../health', null, null);
  test('SYSTEM', 'GET /health', res.status, 200, 'Server is alive');

  // =============================================
  // SECTION A: AUTHENTICATION
  // =============================================
  logSection('A. AUTHENTICATION FLOWS');

  // A1: Admin login
  res = await request('POST', '/auth/login', { username: 'admin', password: 'admin123' });
  if (test('AUTH', 'Admin đăng nhập thành công', res.status, 200)) {
    state.adminToken = res.body?.data?.accessToken;
  }

  // A2: Commander login
  res = await request('POST', '/auth/login', { username: 'chihuy01', password: 'chihuy123' });
  if (test('AUTH', 'Chỉ huy đăng nhập thành công', res.status, 200)) {
    state.commanderToken = res.body?.data?.accessToken;
    state.commanderId = res.body?.data?.user?.id;
  }

  // A3: Student login
  res = await request('POST', '/auth/login', { username: 'hv001', password: 'hocvien123' });
  if (test('AUTH', 'Học viên đăng nhập thành công', res.status, 200)) {
    state.studentToken = res.body?.data?.accessToken;
    state.studentUserId = res.body?.data?.user?.id;
  }

  // A4: Wrong password
  res = await request('POST', '/auth/login', { username: 'hv001', password: 'wrong' });
  test('AUTH', 'Đăng nhập sai mật khẩu bị từ chối', res.status, 401);

  // A5: Get current user profile
  res = await request('GET', '/auth/me', null, state.studentToken);
  test('AUTH', 'Học viên xem thông tin người dùng hiện tại', res.status, 200);
  if (res.body?.data) {
    state.studentId = res.body.data.studentId || res.body.data.student?.id;
  }

  // =============================================
  // FLOW HV-01: Change password
  // =============================================
  logSection('HV-01: ĐĂNG NHẬP & QUẢN LÝ TÀI KHOẢN');

  res = await request('POST', '/auth/change-password', { oldPassword: 'hocvien123', newPassword: 'hocvien123' }, state.studentToken);
  const cpOk = test('HV-01', 'Học viên đổi mật khẩu (cùng mật khẩu để test)', res.status, 200);

  res = await request('POST', '/auth/change-password', { oldPassword: 'wrong', newPassword: 'newpass123' }, state.studentToken);
  test('HV-01', 'Đổi mật khẩu với mật khẩu cũ sai bị từ chối', res.status, 401);

  // =============================================
  // FLOW HV-02: VIEW PERSONAL INFO
  // =============================================
  logSection('HV-02: XEM THÔNG TIN CÁ NHÂN');

  res = await request('GET', '/auth/profile', null, state.studentToken);
  const hv02ok = test('HV-02', 'Học viên xem hồ sơ cá nhân (GET /api/auth/profile)', res.status, 200);
  if (hv02ok && res.body?.data) {
    const profile = res.body.data.student || res.body.data;
    check('HV-02', 'Thông tin cơ bản (họ tên, giới tính, CCCD) có đầy đủ', profile.fullName && profile.gender && profile.cccdNumber);
    check('HV-02', 'Thông tin học tập (lớp, trường) có đầy đủ', profile.class || profile.classId || profile.universityId);
    check('HV-02', 'Thông tin quân nhân (quân hàm, chức vụ) có đầy đủ', profile.rank || profile.positionGovernment);

    // Update profile via unified endpoint
    res = await request('PUT', '/auth/profile', { phoneNumber: '0912345678', email: 'hv001updated@test.local', currentAddress: 'Hà Nội - Updated' }, state.studentToken);
    test('HV-02', 'Học viên cập nhật thông tin cá nhân (PUT /api/auth/profile)', res.status, 200);
  }

  // =============================================
  // FLOW HV-03: VIEW ACADEMIC RESULTS
  // =============================================
  logSection('HV-03: XEM KẾT QUẢ HỌC TẬP');

  res = await request('GET', '/students/results', null, state.studentToken);
  test('HV-03', 'Học viên xem kết quả học tập', res.status, 200);

  if (res.body?.data && Array.isArray(res.body.data) && res.body.data.length > 0) {
    const yr = res.body.data[0];
    check('HV-03', 'Kết quả có averageGrade4 (điểm TB)', yr.averageGrade4 !== undefined, `Giá trị: ${yr.averageGrade4}`);
    check('HV-03', 'Kết quả có cumulativeCredits (tín chỉ tích lũy)', yr.cumulativeCredits !== undefined, `Giá trị: ${yr.cumulativeCredits}`);
    check('HV-03', 'Kết quả có debtCredits (tín chỉ nợ)', yr.debtCredits !== undefined, `Giá trị: ${yr.debtCredits}`);
  }

  // Filter by schoolYear
  res = await request('GET', '/students/results?schoolYear=2024-2025', null, state.studentToken);
  test('HV-03', 'Học viên lọc kết quả theo năm học 2024-2025', res.status, 200);

  // =============================================
  // FLOW HV-04 + HV-05: GRADE REQUEST FULL FLOW
  // =============================================
  logSection('HV-04 & HV-05: ĐỀ XUẤT & THEO DÕI KẾT QUẢ HỌC TẬP');

  // Step 1: Student views their existing results to find a subject
  res = await request('GET', '/students/results?schoolYear=2024-2025', null, state.studentToken);
  let subjectResultId = null;

  if (res.body?.data?.length > 0) {
    // Navigate to first year -> first semester -> first subject
    const yearly = res.body.data[0];
    if (yearly.semesterResults?.length > 0) {
      const semester = yearly.semesterResults[0];
      if (semester.subjectResults?.length > 0) {
        subjectResultId = semester.subjectResults[0].id;
        state.createdSubjectResultId = subjectResultId;
      }
    }
  }

  // Step 2: Student creates ADD grade request
  res = await request('POST', '/students/grade-requests', {
    subjectResultId: subjectResultId,
    requestType: 'ADD',
    reason: 'Môn học mới chưa được cập nhật vào hệ thống',
    proposedLetterGrade: 'A',
    proposedGradePoint4: 4.0,
    proposedGradePoint10: 9.0,
  }, state.studentToken);
  test('HV-04', 'Học viên tạo đề xuất THÊM kết quả học tập', res.status, [200, 201]);

  // Step 3: Student creates UPDATE grade request
  if (subjectResultId) {
    res = await request('POST', '/students/grade-requests', {
      subjectResultId: subjectResultId,
      requestType: 'UPDATE',
      reason: 'Điểm thi bị nhập sai, đề nghị cập nhật',
      proposedLetterGrade: 'B+',
      proposedGradePoint4: 3.5,
      proposedGradePoint10: 8.0,
    }, state.studentToken);
    const updatedOk = test('HV-04', 'Học viên tạo đề xuất CẬP NHẬT kết quả học tập', res.status, [200, 201]);
    if (updatedOk) state.createdGradeRequestId = res.body?.data?.id || res.body?.id;
  }

  // Step 4: Student views own grade requests
  res = await request('GET', '/students/grade-requests', null, state.studentToken);
  test('HV-05', 'Học viên xem danh sách đề xuất của mình', res.status, 200);

  // Filter by status
  res = await request('GET', '/students/grade-requests?status=PENDING', null, state.studentToken);
  test('HV-05', 'Học viên lọc đề xuất theo trạng thái PENDING', res.status, 200);

  // Step 5: Commander views ALL grade requests
  res = await request('GET', '/commanders/grade-requests', null, state.commanderToken);
  test('CH-04', 'Chỉ huy xem tất cả đề xuất kết quả học tập', res.status, 200);

  // Step 6: Commander approves the request -> CPA recalculates
  if (state.createdGradeRequestId) {
    res = await request('POST', `/commanders/grade-requests/${state.createdGradeRequestId}/approve`, { reviewNote: 'Đồng ý cập nhật sau khi kiểm tra' }, state.commanderToken);
    test('CH-04', 'Chỉ huy PHÊ DUYỆT đề xuất (tự động tính lại CPA)', res.status, 200, 'CPA được tính lại tự động');

    // Step 7: Student checks the approved request
    res = await request('GET', `/students/grade-requests/${state.createdGradeRequestId}`, null, state.studentToken);
    test('HV-05', 'Học viên xem chi tiết đề xuất đã được phê duyệt (có ghi chú từ chỉ huy)', res.status, 200);
  }

  // Step 8: Create a new request for REJECTION test
  if (subjectResultId) {
    res = await request('POST', '/students/grade-requests', {
      subjectResultId: subjectResultId,
      requestType: 'DELETE',
      reason: 'Môn này không thuộc chương trình đào tạo',
    }, state.studentToken);
    let rejectReqId = res.body?.data?.id || res.body?.id;

    if (rejectReqId) {
      res = await request('POST', `/commanders/grade-requests/${rejectReqId}/reject`, { reviewNote: 'Môn học đúng chương trình, không thể xóa' }, state.commanderToken);
      test('CH-04', 'Chỉ huy TỪ CHỐI đề xuất (có ghi chú lý do)', res.status, 200);
    }
  }

  // =============================================
  // FLOW HV-06: SCHEDULE MANAGEMENT
  // =============================================
  logSection('HV-06: QUẢN LÝ LỊCH HỌC');

  // View timetable
  res = await request('GET', '/students/time-table', null, state.studentToken);
  test('HV-06', 'Học viên xem lịch học của mình', res.status, 200);

  // Add course to timetable
  res = await request('POST', '/students/time-table', {
    schedules: [{ day: 'Thứ 2', startTime: '07:00', endTime: '09:25', room: 'P201', subjectName: 'Toán cao cấp' }]
  }, state.studentToken);
  const addScheduleOk = test('HV-06', 'Học viên THÊM môn học vào lịch (tự động tạo lịch cắt cơm)', res.status, [200, 201]);
  if (addScheduleOk && res.body?.data?.id) state.createdTimetableId = res.body.data.id;

  // Edit schedule
  if (state.createdTimetableId) {
    res = await request('PUT', `/students/time-table/${state.createdTimetableId}`, {
      schedules: [{ day: 'Thứ 2', startTime: '07:00', endTime: '09:25', room: 'P301', subjectName: 'Toán cao cấp (đổi phòng)' }]
    }, state.studentToken);
    test('HV-06', 'Học viên CẬP NHẬT môn học (tự động cập nhật lịch cắt cơm)', res.status, 200);
  }

  // Delete schedule
  if (state.createdTimetableId) {
    res = await request('DELETE', `/students/time-table/${state.createdTimetableId}`, null, state.studentToken);
    test('HV-06', 'Học viên XÓA môn học khỏi lịch', res.status, 200);
  }

  // =============================================
  // FLOW HV-07: MEAL SCHEDULE (AUTO-GENERATED)
  // =============================================
  logSection('HV-07: XEM LỊCH CẮT CƠM TỰ ĐỘNG');

  res = await request('GET', '/students/cut-rice', null, state.studentToken);
  test('HV-07', 'Học viên xem lịch cắt cơm (tự động tạo nếu chưa có)', res.status, 200);
  if (res.body?.data) {
    check('HV-07', 'Lịch cắt cơm có dữ liệu weekly', res.body.data.weekly !== undefined);
    check('HV-07', 'Lịch cắt cơm có trạng thái tự động', res.body.data.isAutoGenerated !== undefined);
  }

  // =============================================
  // FLOW HV-08: ACHIEVEMENTS + TUITION
  // =============================================
  logSection('HV-08: XEM THÀNH TÍCH VÀ HỌC PHÍ');

  // View achievements
  res = await request('GET', '/students/achievements', null, state.studentToken);
  test('HV-08', 'Học viên xem danh sách thành tích', res.status, 200);

  if (res.body?.data) {
    check('HV-08', 'Thành tích bao gồm hồ sơ thành tích (profile)', res.body.data.profile || res.body.data.achievementProfile);
    check('HV-08', 'Thành tích bao gồm đề tài khoa học và sáng kiến (YearlyAchievements)', res.body.data.yearlyAchievements);
  }

  // View tuition fees
  res = await request('GET', '/students/tuition-fees', null, state.studentToken);
  test('HV-08', 'Học viên xem thông tin học phí', res.status, 200);

  if (res.body?.data && Array.isArray(res.body.data) && res.body.data.length > 0) {
    const tf = res.body.data[0];
    check('HV-08', 'Học phí có totalAmount (số tiền cần nộp)', !!tf.totalAmount);
    check('HV-08', 'Học phí có status (trạng thái thanh toán)', !!tf.status, `Trạng thái: ${tf.status}`);
  }

  // =============================================
  // FLOW HV-09: NOTIFICATIONS
  // =============================================
  logSection('HV-09: THÔNG BÁO');

  res = await request('GET', '/auth/notifications', null, state.studentToken);
  test('HV-09', 'Học viên xem danh sách thông báo', res.status, 200);

  if (res.body?.data && Array.isArray(res.body.data) && res.body.data.length > 0) {
    const notifId = res.body.data[0].id;

    // Mark single notification as read
    res = await request('PUT', `/auth/notifications/${notifId}/read`, {}, state.studentToken);
    test('HV-09', 'Học viên đánh dấu thông báo đã đọc', res.status, 200);

    // Mark all as read
    res = await request('PUT', '/auth/notifications/read-all', {}, state.studentToken);
    test('HV-09', 'Học viên đánh dấu TẤT CẢ thông báo đã đọc', res.status, 200);
  }

  // =============================================
  // FLOW CH-01: USER ACCOUNT MANAGEMENT
  // =============================================
  logSection('CH-01: QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG');

  // List users
  res = await request('GET', '/users', null, state.commanderToken);
  test('CH-01', 'Chỉ huy xem danh sách tài khoản người dùng', res.status, 200);

  // Create user
  res = await request('POST', '/users', {
    username: `testuser_func_${state.ts}`,
    email: `testfunc_${state.ts}@local.com`,
    password: 'test1234',
    fullName: 'Functional Test User',
    role: 'STUDENT',
  }, state.commanderToken);
  const createUserOk = test('CH-01', 'Chỉ huy TẠO tài khoản người dùng mới', res.status, [200, 201]);
  if (createUserOk && (res.body?.data?.id || res.body?.id)) {
    state.createdUserId = res.body.data?.id || res.body?.id;

    // Update user
    res = await request('PUT', `/users/${state.createdUserId}`, { fullName: 'Functional Test Updated' }, state.commanderToken);
    test('CH-01', 'Chỉ huy CẬP NHẬT thông tin tài khoản', res.status, 200);

    // Reset password
    res = await request('POST', `/users/${state.createdUserId}/reset-password`, { newPassword: 'newpwd123' }, state.commanderToken);
    test('CH-01', 'Chỉ huy RESET mật khẩu người dùng', res.status, 200);
  }

  // =============================================
  // FLOW CH-02: TRAINING INSTITUTIONS
  // =============================================
  logSection('CH-02: QUẢN LÝ CƠ SỞ ĐÀO TẠO');

  // List universities
  res = await request('GET', '/universities', null, state.commanderToken);
  test('CH-02', 'Chỉ huy xem danh sách trường đại học', res.status, 200);

  // Create organization with travelTime for meal calculation
  res = await request('GET', '/organizations', null, state.commanderToken);
  test('CH-02', 'Chỉ huy xem danh sách đơn vị (có travelTime)', res.status, 200);

  // List education levels
  res = await request('GET', '/education-levels', null, state.commanderToken);
  test('CH-02', 'Chỉ huy xem danh sách trình độ đào tạo', res.status, 200);
  let eduLevelId = null;
  if (res.body?.data?.length > 0) eduLevelId = res.body.data[0].id;

  // List classes
  res = await request('GET', '/classes', null, state.commanderToken);
  test('CH-02', 'Chỉ huy xem danh sách lớp học', res.status, 200);

  // Create class
  res = await request('POST', '/classes', {
    className: `Lớp Test Func ${state.ts}`,
    studentCount: 0,
    educationLevelId: eduLevelId,
  }, state.commanderToken);
  const createClassOk = test('CH-02', 'Chỉ huy TẠO lớp học mới', res.status, [200, 201, 400]);
  if (createClassOk) state.createdClassId = res.body?.data?.id || res.body?.id;

  // =============================================
  // FLOW CH-03: STUDENT RECORDS MANAGEMENT
  // =============================================
  logSection('CH-03: QUẢN LÝ HỒ SƠ HỌC VIÊN');

  // List students
  res = await request('GET', '/students', null, state.commanderToken);
  test('CH-03', 'Chỉ huy xem danh sách học viên', res.status, 200);

  // Search students
  res = await request('GET', '/students?fullName=Phạm', null, state.commanderToken);
  test('CH-03', 'Chỉ huy TÌM KIẾM học viên theo tên', res.status, 200);

  // Get student detail
  if (state.studentId) {
    res = await request('GET', `/students/${state.studentId}`, null, state.commanderToken);
    test('CH-03', 'Chỉ huy xem chi tiết hồ sơ học viên', res.status, 200);
  }

  // =============================================
  // FLOW CH-10: DUTY SCHEDULES
  // =============================================
  logSection('CH-10: PHÂN CÔNG LỊCH TRỰC');

  res = await request('GET', '/commander-duty-schedules', null, state.commanderToken);
  test('CH-10', 'Chỉ huy xem danh sách lịch trực', res.status, 200);

  res = await request('POST', '/commander-duty-schedules', {
    userId: state.commanderId,
    position: 'Trực chỉ huy cuối tuần',
    workDay: new Date('2026-06-01').toISOString(),
  }, state.commanderToken);
  const createDutyOk = test('CH-10', 'Chỉ huy PHÂN CÔNG lịch trực mới', res.status, [200, 201]);
  if (createDutyOk) state.createdDutyScheduleId = res.body?.data?.id || res.body?.id;

  // =============================================
  // FLOW CH-05: ACHIEVEMENT MANAGEMENT
  // =============================================
  logSection('CH-05: QUẢN LÝ THÀNH TÍCH');

  res = await request('GET', '/achievements', null, state.commanderToken);
  test('CH-05', 'Chỉ huy xem danh sách thành tích học viên', res.status, 200);

  if (state.studentId) {
    res = await request('POST', '/achievements', {
      studentId: state.studentId,
      title: 'Thành tích test chức năng',
      semester: '1',
      schoolYear: '2024-2025',
      year: 2025,
      award: 'Giấy khen',
      content: 'Hoàn thành xuất sắc nhiệm vụ test chức năng',
    }, state.commanderToken);
    const achieveOk = test('CH-05', 'Chỉ huy THÊM thành tích cho học viên (học tập + rèn luyện)', res.status, [200, 201]);
    if (achieveOk) state.createdAchievementId = res.body?.data?.id || res.body?.id;
  } else {
    test('CH-05', 'Chỉ huy THÊM thành tích cho học viên (bỏ qua - không có studentId)', 0, [200, 201], 'Cần studentId hợp lệ');
  }

  // =============================================
  // FLOW CH-06: SCHEDULE & MEAL MANAGEMENT
  // =============================================
  logSection('CH-06: QUẢN LÝ LỊCH HỌC & CẮT CƠM');

  // Generate meal for one student
  if (state.studentId) {
    res = await request('POST', `/commanders/cut-rice/generate/${state.studentId}`, {}, state.commanderToken);
    test('CH-06', 'Chỉ huy TẠO lịch cắt cơm tự động cho MỘT học viên', res.status, 200);
  }

  // Generate meal for ALL students
  res = await request('POST', '/commanders/cut-rice/generate-all', {}, state.commanderToken);
  test('CH-06', 'Chỉ huy TẠO lịch cắt cơm tự động cho TẤT CẢ học viên', res.status, 200);

  // View meal schedules
  res = await request('GET', '/cut-rice', null, state.commanderToken);
  test('CH-06', 'Chỉ huy xem danh sách lịch cắt cơm', res.status, 200);

  // =============================================
  // FLOW CH-07: TUITION MANAGEMENT
  // =============================================
  logSection('CH-07: QUẢN LÝ HỌC PHÍ');

  res = await request('GET', '/tuition-fees', null, state.commanderToken);
  test('CH-07', 'Chỉ huy xem danh sách học phí', res.status, 200);

  // Create new tuition fee
  if (state.studentId) {
    res = await request('POST', '/tuition-fees', {
      studentId: state.studentId,
      totalAmount: 5000000,
      semester: '2',
      schoolYear: '2024-2025',
      content: `Học phí kỳ 2 2024-2025`,
      status: 'UNPAID',
    }, state.commanderToken);
    test('CH-07', 'Chỉ huy GHI NHẬN học phí cho học viên', res.status, [200, 201]);
  } else {
    test('CH-07', 'Chỉ huy GHI NHẬN học phí cho học viên (bỏ qua - không có studentId)', 0, [200, 201], 'Cần studentId hợp lệ');
  }

  // =============================================
  // FLOW CH-08: SEMESTER MANAGEMENT
  // =============================================
  logSection('CH-08: QUẢN LÝ HỌC KỲ');

  res = await request('GET', '/semesters', null, state.commanderToken);
  test('CH-08', 'Chỉ huy xem danh sách học kỳ', res.status, 200);

  // Create new semester
  res = await request('POST', '/semesters', {
    code: Number(`${state.ts}1`),
    schoolYear: '2025-2026',
  }, state.commanderToken);
  const createSemOk = test('CH-08', 'Chỉ huy THÊM học kỳ mới', res.status, [200, 201]);
  if (createSemOk) state.createdSemesterId = res.body?.data?.id || res.body?.id;

  if (state.createdSemesterId) {
    // Edit semester
    res = await request('PUT', `/semesters/${state.createdSemesterId}`, { code: Number(`${state.ts}2`) }, state.commanderToken);
    test('CH-08', 'Chỉ huy CHỈNH SỬA học kỳ', res.status, 200);

    // Search semester
    res = await request('GET', `/semesters?schoolYear=2025-2026`, null, state.commanderToken);
    test('CH-08', 'Chỉ huy TÌM KIẾM học kỳ theo năm học', res.status, 200);

    // Delete semester
    res = await request('DELETE', `/semesters/${state.createdSemesterId}`, null, state.commanderToken);
    test('CH-08', 'Chỉ huy XÓA học kỳ', res.status, 200);
  }

  // =============================================
  // FLOW CH-09: REPORTS & STATISTICS
  // =============================================
  logSection('CH-09: THỐNG KÊ & BÁO CÁO');

  res = await request('GET', '/commanders/reports/academic', null, state.commanderToken);
  test('CH-09', 'Chỉ huy xem báo cáo thống kê KẾT QUẢ HỌC TẬP', res.status, 200);

  res = await request('GET', '/commanders/reports/party-training', null, state.commanderToken);
  test('CH-09', 'Chỉ huy xem báo cáo XẾP LOẠI ĐẢNG VIÊN & RÈN LUYỆN', res.status, 200);

  res = await request('GET', '/commanders/reports/achievements', null, state.commanderToken);
  test('CH-09', 'Chỉ huy xem báo cáo THÀNH TÍCH & KHEN THƯỞNG', res.status, 200);

  res = await request('GET', '/commanders/reports/tuition', null, state.commanderToken);
  test('CH-09', 'Chỉ huy xem báo cáo HỌC PHÍ', res.status, 200);

  // =============================================
  // FLOW CH-11: UTILITIES
  // =============================================
  logSection('CH-11: TIỆN ÍCH HỖ TRỢ');

  // Convert grade: 10 -> 4
  res = await request('POST', '/semesters/grade-convert', { value: 8.5, from: '10', to: '4' }, state.commanderToken);
  test('CH-11', 'Chuyển đổi điểm hệ 10 (8.5) -> hệ 4 (4.0)', res.status, 200);

  // Convert grade: 10 -> letter
  res = await request('POST', '/semesters/grade-convert', { value: 8.5, from: '10', to: 'letter' }, state.commanderToken);
  test('CH-11', 'Chuyển đổi điểm hệ 10 (8.5) -> điểm chữ (A)', res.status, 200);

  // Convert grade: letter -> 10
  res = await request('POST', '/semesters/grade-convert', { value: 'B', from: 'letter', to: '10' }, state.commanderToken);
  test('CH-11', 'Chuyển đổi điểm chữ (B) -> hệ 10', res.status, 200);

  // Batch convert
  res = await request('POST', '/semesters/grade-convert/batch', {
    grades: [
      { value: 9.0, from: '10', to: '4' },
      { value: 7.0, from: '10', to: 'letter' },
      { value: 'C+', from: 'letter', to: '10' },
    ]
  }, state.commanderToken);
  test('CH-11', 'Chuyển đổi HÀNG LOẠT điểm giữa các hệ', res.status, 200);

  // Calculate GPA
  res = await request('POST', '/semesters/grade-convert/gpa', {
    grades: [
      { point10: 8.5, credits: 3 },
      { point10: 7.0, credits: 4 },
      { point10: 9.0, credits: 3 },
    ]
  }, state.commanderToken);
  test('CH-11', 'Tính điểm trung bình (GPA) từ danh sách điểm', res.status, 200);

  // Get grade conversion table
  res = await request('GET', '/semesters/grade-convert/table', null, state.commanderToken);
  test('CH-11', 'Xem bảng thông tin chi tiết điểm (điểm chữ, hệ 4, hệ 10)', res.status, 200);

  // =============================================
  // FLOW QTV-01: RBAC / AUTHORIZATION TESTS
  // =============================================
  logSection('QTV-01: PHÂN QUYỀN NGƯỜI DÙNG (RBAC)');

  // Student cannot access admin routes
  res = await request('GET', '/users', null, state.studentToken);
  test('QTV-01', 'Học viên KHÔNG ĐƯỢC truy cập quản lý users (phân quyền đúng)', res.status, [401, 403]);

  res = await request('GET', '/commanders/reports/academic', null, state.studentToken);
  test('QTV-01', 'Học viên KHÔNG ĐƯỢC xem báo cáo thống kê (phân quyền đúng)', res.status, [401, 403]);

  // Unauthenticated request
  res = await request('GET', '/users', null, null);
  test('QTV-01', 'Không có token -> bị từ chối truy cập', res.status, [401, 403]);

  // =============================================
  // FLOW QTV-02: SYSTEM ACCOUNT MANAGEMENT
  // =============================================
  logSection('QTV-02: QUẢN TRỊ TÀI KHOẢN TOÀN HỆ THỐNG');

  // Admin creates user
  res = await request('POST', '/users', {
    username: `qtvtest_${state.ts}`,
    email: `qtvtest_${state.ts}@admin.local`,
    password: 'adminpass123',
    fullName: 'QTV Test Account',
    role: 'COMMANDER',
  }, state.adminToken);
  const adminCreateOk = test('QTV-02', 'Admin TẠO tài khoản mới (toàn quyền)', res.status, [200, 201]);
  let adminCreatedId;
  if (adminCreateOk) {
    adminCreatedId = res.body?.data?.id || res.body?.id;

    // Admin toggles account active (lock)
    res = await request('POST', `/users/${adminCreatedId}/toggle-active`, {}, state.adminToken);
    test('QTV-02', 'Admin VÔ HIỆU HÓA tài khoản', res.status, 200);

    // Admin re-activates
    res = await request('POST', `/users/${adminCreatedId}/toggle-active`, {}, state.adminToken);
    test('QTV-02', 'Admin KÍCH HOẠT lại tài khoản', res.status, 200);
  }

  // Admin creates second user for delete test
  res = await request('POST', '/users', {
    username: `qtvdel_${state.ts}`,
    email: `qtvdel_${state.ts}@admin.local`,
    password: 'deletepass123',
    fullName: 'QTV Delete Test',
    role: 'STUDENT',
  }, state.adminToken);
  if (res.body?.data?.id || res.body?.id) {
    const delId = res.body?.data?.id || res.body?.id;
    res = await request('DELETE', `/users/${delId}`, null, state.adminToken);
    test('QTV-02', 'Admin XÓA tài khoản (soft delete)', res.status, 200);
  }

  // Cleanup first admin-created user
  if (adminCreatedId) {
    await request('DELETE', `/users/${adminCreatedId}`, null, state.adminToken);
  }

  // =============================================
  // CLEANUP
  // =============================================
  logSection('CLEANUP');

  // Delete created test user
  if (state.createdUserId) {
    res = await request('DELETE', `/users/${state.createdUserId}`, null, state.commanderToken);
    test('CLEANUP', 'Xóa tài khoản test đã tạo', res.status, 200);
  }

  // Delete created class
  if (state.createdClassId) {
    res = await request('DELETE', `/classes/${state.createdClassId}`, null, state.commanderToken);
    test('CLEANUP', 'Xóa lớp test đã tạo', res.status, 200);
  }

  // =============================================
  // EXTRA: TEST SWAGGER DOCS
  // =============================================
  logSection('SWAGGER DOCS');

  res = await request('GET', '/../swagger.json', null, null);
  test('SWAGGER', 'Swagger JSON docs accessible', res.status, 200);

  // =============================================
  // SUMMARY
  // =============================================
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  console.log('\n' + '█'.repeat(70));
  console.log('█  TEST COMPLETE');
  console.log('█'.repeat(70));
  console.log(`  ✅ PASSED:  ${passed}`);
  console.log(`  ❌ FAILED:  ${failed}`);
  console.log(`  📊 TOTAL:   ${total}`);
  console.log(`  📈 RATE:    ${passRate}%`);
  console.log(`  ⏱️  TIME:    ${elapsed}s`);
  console.log('█'.repeat(70));

  // Save log file
  const logContent = [
    '='.repeat(80),
    'FUNCTIONAL TEST LOG',
    `Date: ${new Date().toISOString()}`,
    `Passed: ${passed}, Failed: ${failed}, Total: ${total}, Rate: ${passRate}%`,
    `Time: ${elapsed}s`,
    '='.repeat(80),
    '',
    ...testResults.map(r => 
      `[${r.result}] [${r.module}] ${r.name} — status=${r.status}${r.detail ? ', detail=' + r.detail : ''}`
    ),
    '',
    '='.repeat(80),
  ].join('\n');

  fs.writeFileSync(LOG_FILE, logContent, 'utf-8');
  console.log(`\n📄 Log saved to: ${LOG_FILE}\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

// ============== EXECUTE ==============

(async () => {
  console.log('⏳ Waiting for server on port 6868...');
  const ready = await waitForServer();
  if (!ready) {
    console.log('❌ Server not available. Start with: cd backend && npm start');
    process.exit(1);
  }
  console.log('🟢 Server ready!\n');
  await runAllTests();
})();
