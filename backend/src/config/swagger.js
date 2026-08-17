const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Manager API',
      version: '2.0.0',
      description: `
# Hệ thống Quản lý Học viên

API cho 3 nhóm: **Học viên**, **Chỉ huy**, **Quản trị viên**

## Phân quyền

| Hành động | STUDENT | COMMANDER | ADMIN |
|-----------|:---:|:---:|:---:|
| Tự sửa profile, đổi mật khẩu | ✅ | ✅ | ✅ |
| Đăng ký / Tạo user | ❌ | ❌ | ✅ |
| Sửa user | ❌ | ✅ (chỉ STUDENT) | ✅ |
| Xóa user, reset password, khóa/mở | ❌ | ❌ | ✅ |
| Quản lý hồ sơ, Xóa hồ sơ | ❌ | ✅ (chỉ STUDENT) | ✅ |
| Dữ liệu khác (achievement, fee, report...) | ❌ | ✅ | ✅ |

## Kiến trúc
- **User** 1:1 **Profile** (gộp Student + Commander)
- Child models → FK: \`userId\`
- Profile → FK: \`classId\`, \`organizationId\`, \`universityId\`, \`educationLevelId\`

## Auth
- Bearer token: \`Authorization: Bearer <token>\`
- Login: \`POST /api/auth/login\` → accessToken (5h) + refreshToken (7d)
`,
    },
    servers: [{ url: 'http://localhost:6868/api', description: 'Local' }],
    tags: [
      { name: 'Auth', description: 'HV-01: Đăng nhập & Quản lý tài khoản' },
      { name: 'Profile', description: 'HV-02: Thông tin cá nhân' },
      { name: 'Notifications', description: 'HV-09: Thông báo' },
      { name: 'Users', description: 'CH-01, QTV-02: Quản lý tài khoản người dùng' },
      { name: 'Profiles', description: 'CH-03: Quản lý hồ sơ (gộp Student + Commander)' },
      { name: 'Grade Requests', description: 'HV-04/05 + CH-04: Đề xuất & Phê duyệt KQHT' },
      { name: 'Reports', description: 'CH-09: Thống kê & Báo cáo' },
      { name: 'Cut Rice', description: 'HV-07 + CH-06: Lịch cắt cơm' },
      { name: 'Universities', description: 'CH-02: Trường đại học' },
      { name: 'Organizations', description: 'CH-02: Đơn vị/Khoa' },
      { name: 'Education Levels', description: 'CH-02: Trình độ đào tạo' },
      { name: 'Classes', description: 'CH-02: Lớp học' },
      { name: 'Semesters', description: 'CH-08 + CH-11: Học kỳ & Tiện ích điểm' },
      { name: 'Time Tables', description: 'Thời khóa biểu' },
      { name: 'Tuition Fees', description: 'CH-07: Học phí' },
      { name: 'Achievements', description: 'CH-05: Thành tích' },
      { name: 'Duty Schedules', description: 'CH-10: Lịch trực' },
      { name: 'Academic Results', description: 'HV-03: Kết quả học tập' },
      { name: 'Resources', description: 'CRUD chung: yearly-results, semester-results, subject-results, scientific...' },
    ],
    components: {
      securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        Error: { type: 'object', properties: { success: { type: 'boolean' }, statusCode: { type: 'integer' }, message: { type: 'string' } } },
        Pagination: { type: 'object', properties: { pageIndex: { type: 'integer' }, pageSize: { type: 'integer' }, totalPages: { type: 'integer' }, total: { type: 'integer' } } },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, username: { type: 'string' },
            role: { type: 'string', enum: ['STUDENT', 'COMMANDER', 'ADMIN'] },
            isAdmin: { type: 'boolean' }, profileId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, code: { type: 'string', description: 'Mã HV/CH' },
            fullName: { type: 'string' }, email: { type: 'string' }, gender: { type: 'string' },
            birthday: { type: 'string', format: 'date' }, hometown: { type: 'string' },
            ethnicity: { type: 'string' }, religion: { type: 'string' },
            currentAddress: { type: 'string' }, placeOfBirth: { type: 'string' },
            phoneNumber: { type: 'string' }, cccd: { type: 'string' },
            partyMemberCardNumber: { type: 'string' },
            unit: { type: 'string' }, rank: { type: 'string', enum: ['Binh nhì', 'Binh nhất', 'Hạ sĩ', 'Trung sĩ', 'Thượng sĩ', 'Thiếu úy', 'Trung úy', 'Thượng úy', 'Đại úy', 'Thiếu tá', 'Trung tá', 'Thượng tá', 'Đại tá', 'Thiếu tướng', 'Trung tướng', 'Thượng tướng', 'Đại tướng'], description: 'Cấp bậc quân hàm' },
            positionGovernment: { type: 'string' }, positionParty: { type: 'string' },
            fullPartyMember: { type: 'string', format: 'date' },
            probationaryPartyMember: { type: 'string', format: 'date' },
            dateOfEnlistment: { type: 'string', format: 'date' },
            avatar: { type: 'string' },
            enrollment: { type: 'integer', description: 'Khóa học (Student)' },
            graduationDate: { type: 'string', format: 'date' },
            currentCpa4: { type: 'number' }, currentCpa10: { type: 'number' },
            familyMember: { type: 'object' }, foreignRelations: { type: 'object' },
            startWork: { type: 'integer', description: 'Năm bắt đầu công tác (Commander)' },
            organization: { type: 'string', description: 'Cơ quan (Commander)' },
            classId: { type: 'string', format: 'uuid' }, organizationId: { type: 'string', format: 'uuid' },
            universityId: { type: 'string', format: 'uuid' }, educationLevelId: { type: 'string', format: 'uuid' },
          },
        },
        YearlyResult: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, schoolYear: { type: 'string' }, averageGrade4: { type: 'number' }, averageGrade10: { type: 'number' }, cumulativeGrade4: { type: 'number' }, cumulativeGrade10: { type: 'number' }, cumulativeCredits: { type: 'integer' }, totalCredits: { type: 'integer' }, passedSubjects: { type: 'integer' }, failedSubjects: { type: 'integer' }, debtCredits: { type: 'integer' }, partyRating: { type: 'string' }, trainingRating: { type: 'string' } } },
        SemesterResult: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, semester: { type: 'string' }, schoolYear: { type: 'string' }, yearlyResultId: { type: 'string' }, totalCredits: { type: 'integer' }, averageGrade4: { type: 'number' }, averageGrade10: { type: 'number' }, cumulativeCredits: { type: 'integer' }, cumulativeGrade4: { type: 'number' }, cumulativeGrade10: { type: 'number' }, debtCredits: { type: 'integer' }, failedSubjects: { type: 'integer' } } },
        SubjectResult: { type: 'object', properties: { id: { type: 'string' }, semesterResultId: { type: 'string' }, subjectCode: { type: 'string' }, subjectName: { type: 'string' }, credits: { type: 'integer' }, letterGrade: { type: 'string' }, gradePoint4: { type: 'number' }, gradePoint10: { type: 'number' } } },
        SchoolYear: { type: 'object', properties: { id: { type: 'string' }, schoolYear: { type: 'string', example: '2024-2025' } } },
        Semester: { type: 'object', properties: { id: { type: 'string' }, code: { type: 'integer', example: 1 }, schoolYearId: { type: 'string', format: 'uuid' }, schoolYearInfo: { $ref: '#/components/schemas/SchoolYear' } } },
        SemesterInput: { type: 'object', required: ['code'], properties: { code: { type: 'integer', example: 1 }, schoolYearId: { type: 'string', format: 'uuid' }, schoolYear: { type: 'string', example: '2024-2025', description: 'Có thể truyền thay schoolYearId' } } },
        TimeTable: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, semesterId: { type: 'string' }, schedules: { type: 'array', items: { type: 'object', properties: { day: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, room: { type: 'string' }, subjectName: { type: 'string' }, week: { oneOf: [{ type: 'integer' }, { type: 'array', items: { type: 'integer' } }] } } } } } },
        TuitionFee: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, semesterId: { type: 'string' }, totalAmount: { type: 'number' }, semester: { type: 'string' }, schoolYear: { type: 'string' }, content: { type: 'string' }, status: { type: 'string', enum: ['PAID', 'UNPAID'] } } },
        Achievement: { type: 'object', required: ['userId'], properties: { id: { type: 'string', format: 'uuid', readOnly: true }, userId: { type: 'string', format: 'uuid' }, title: { type: 'string', example: 'Chiến sĩ thi đua cấp cơ sở' }, award: { type: 'string', example: 'Chiến sĩ thi đua' }, semester: { type: 'integer', example: 1 }, schoolYear: { type: 'string', example: '2025-2026' }, year: { type: 'integer', example: 2026 }, content: { type: 'string' }, description: { type: 'string' } } },
        AchievementBatchItem: { type: 'object', required: ['studentCode'], properties: { studentCode: { type: 'string', example: 'HV001' }, title: { type: 'string' }, award: { type: 'string' }, semester: { type: 'integer', example: 1 }, schoolYear: { type: 'string', example: '2025-2026' }, year: { type: 'integer', example: 2026 }, content: { type: 'string' }, description: { type: 'string' } } },
        AchievementProfile: { type: 'object', required: ['userId'], properties: { id: { type: 'string', format: 'uuid', readOnly: true }, userId: { type: 'string', format: 'uuid' }, totalYears: { type: 'integer', example: 4 }, totalAdvancedSoldier: { type: 'integer', example: 2 }, totalCompetitiveSoldier: { type: 'integer', example: 1 }, totalScientificTopics: { type: 'integer', example: 2 }, totalScientificInitiatives: { type: 'integer', example: 1 }, eligibleForMinistryReward: { type: 'boolean' }, eligibleForNationalReward: { type: 'boolean' } } },
        YearlyAchievement: { type: 'object', required: ['userId', 'year'], properties: { id: { type: 'string', format: 'uuid', readOnly: true }, userId: { type: 'string', format: 'uuid' }, year: { type: 'integer', example: 2026 }, decisionNumber: { type: 'string', example: 'QD-123/2026' }, decisionDate: { type: 'string', format: 'date', example: '2026-05-20' }, title: { type: 'string', example: 'Thành tích năm 2026' }, hasMinistryReward: { type: 'boolean' }, hasNationalReward: { type: 'boolean' }, notes: { type: 'string' } } },
        YearlyAchievementFull: { type: 'object', required: ['year'], properties: { studentCode: { type: 'string', example: 'HV001', description: 'Truyền studentCode hoặc userId' }, userId: { type: 'string', format: 'uuid', description: 'Truyền userId hoặc studentCode' }, year: { type: 'integer', example: 2026 }, decisionNumber: { type: 'string' }, decisionDate: { type: 'string', format: 'date' }, title: { type: 'string' }, hasMinistryReward: { type: 'boolean' }, hasNationalReward: { type: 'boolean' }, notes: { type: 'string' }, scientificTopics: { type: 'array', items: { $ref: '#/components/schemas/ScientificTopic' } }, scientificInitiatives: { type: 'array', items: { $ref: '#/components/schemas/ScientificInitiative' } } } },
        ScientificTopic: { type: 'object', required: ['yearlyAchievementId', 'title'], properties: { id: { type: 'string', format: 'uuid', readOnly: true }, yearlyAchievementId: { type: 'string', format: 'uuid' }, title: { type: 'string', example: 'Đề tài ứng dụng AI trong quản lý học viên' }, description: { type: 'string' }, year: { type: 'integer', example: 2026 }, status: { type: 'string', example: 'Đã nghiệm thu' } } },
        ScientificInitiative: { type: 'object', required: ['yearlyAchievementId', 'title'], properties: { id: { type: 'string', format: 'uuid', readOnly: true }, yearlyAchievementId: { type: 'string', format: 'uuid' }, title: { type: 'string', example: 'Sáng kiến cải tiến quy trình điểm danh' }, description: { type: 'string' }, year: { type: 'integer', example: 2026 }, status: { type: 'string', example: 'Đã công nhận' } } },
        CutRice: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, weekly: { type: 'object' }, isAutoGenerated: { type: 'boolean' }, lastUpdated: { type: 'string' }, notes: { type: 'string' } } },
        DutySchedule: { type: 'object', properties: { id: { type: 'integer' }, fullName: { type: 'string' }, rank: { type: 'string' }, phoneNumber: { type: 'string' }, position: { type: 'string' }, workDay: { type: 'string' } } },
        Notification: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' }, type: { type: 'string', enum: ['GRADE', 'CUT_RICE', 'ACHIEVEMENT', 'TUITION', 'GENERAL'] }, isRead: { type: 'boolean' } } },
        GradeRequest: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, subjectResultId: { type: 'string' }, requestType: { type: 'string', enum: ['ADD', 'UPDATE', 'DELETE'] }, reason: { type: 'string' }, proposedLetterGrade: { type: 'string' }, proposedGradePoint4: { type: 'number' }, proposedGradePoint10: { type: 'number' }, attachmentUrl: { type: 'string' }, status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] }, reviewerId: { type: 'string' }, reviewNote: { type: 'string' }, reviewedAt: { type: 'string' } } },
      },
      responses: {
        400: { description: 'Lỗi dữ liệu', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: 'Chưa xác thực', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Không có quyền', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Không tìm thấy', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.route.js')],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
