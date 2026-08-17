import { z } from "zod";

/**
 * Schema validation cho form đăng nhập
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Schema validation cho form đổi mật khẩu
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Mật khẩu cũ không được để trống"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Schema validation cho form đặt lại mật khẩu (Admin)
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu mới phải ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const createUserSchema = z.object({
  username: z.string().min(3, "Username phải ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ").optional().or(z.literal("")),
  fullName: z.string().min(1, "Họ và tên không được để trống"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  role: z.enum(["STUDENT", "COMMANDER", "ADMIN"]),
  commanderId: z.string().nullable().or(z.literal("")).optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, "Username phải ít nhất 3 ký tự"),
  code: z.string().min(1, "Mã không được để trống"),
  fullName: z.string().min(1, "Họ và tên không được để trống"),
  email: z.email("Email không hợp lệ").nullable().or(z.literal("")).optional(),
  phoneNumber: z.string().nullable().or(z.literal("")).optional(),
  birthday: z.string().nullable().or(z.literal("")).optional(),
  cccd: z.string().nullable().or(z.literal("")).optional(),
  gender: z.enum(["MALE", "FEMALE"], "Giới tính không được để trống"),
  hometown: z.string().nullable().or(z.literal("")).optional(),
  placeOfBirth: z.string().nullable().or(z.literal("")).optional(),
  ethnicity: z.string().nullable().or(z.literal("")).optional(),
  religion: z.string().nullable().or(z.literal("")).optional(),
  rank: z.string().nullable().or(z.literal("")).optional(),
  unit: z.string().nullable().or(z.literal("")).optional(),
  positionGovernment: z.string().nullable().or(z.literal("")).optional(),
  positionParty: z.string().nullable().or(z.literal("")).optional(),
  currentAddress: z.string().nullable().or(z.literal("")).optional(),
  dateOfEnlistment: z.string().nullable().or(z.literal("")).optional(),
  partyMemberCardNumber: z.string().nullable().or(z.literal("")).optional(),
  probationaryPartyMember: z.string().nullable().or(z.literal("")).optional(),
  fullPartyMember: z.string().nullable().or(z.literal("")).optional(),
  familyMember: z.string().nullable().or(z.literal("")).optional(),
  foreignRelations: z.string().nullable().or(z.literal("")).optional(),
  enrollment: z.number().nullable().optional(),
  currentCpa4: z.number().nullable().optional(),
  currentCpa10: z.number().nullable().optional(),
  graduationDate: z.string().nullable().or(z.literal("")).optional(),
  startWork: z.number().nullable().optional(),
  commanderId: z.string().nullable().or(z.literal("")).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

/**
 * Schema cho việc tạo tài khoản hàng loạt từ Excel
 */
export const batchUserSchema = z.array(
  z.object({
    username: z.string().min(3, "Username phải ít nhất 3 ký tự"),
    fullName: z.string().min(1, "Họ và tên không được để trống"),
    email: z
      .email("Email không hợp lệ")
      .nullable()
      .or(z.literal(""))
      .optional(),
    role: z.enum(["STUDENT", "COMMANDER", "ADMIN"], "Role không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự").optional(),
  })
);

/**
 * Schema cho file Excel tải lên
 */
export const batchExcelFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Dung lượng file tối đa là 5MB")
    .refine(
      (f) => /\.(xlsx|xls)$/i.test(f.name),
      "Chỉ chấp nhận file Excel (.xlsx, .xls)"
    ),
});

export type BatchExcelFileValues = z.infer<typeof batchExcelFileSchema>;

/**
 * Schema validation cho form thêm/sửa trường đại học
 */
export const universitySchema = z.object({
  universityCode: z
    .string()
    .min(1, "Mã trường là bắt buộc")
    .max(50, "Tối đa 50 ký tự"),
  universityName: z
    .string()
    .min(1, "Tên trường là bắt buộc")
    .max(255, "Tối đa 255 ký tự"),
  status: z.enum(["ACTIVE", "INACTIVE"], "Trạng thái không hợp lệ"),
  organizations: z
    .array(
      z.object({
        organizationName: z.string().min(1, "Tên khoa/ngành không được để trống"),
        educationLevels: z.string().optional(),
      })
    )
    .optional(),
});

export type UniversityFormValues = z.infer<typeof universitySchema>;

/**
 * Schema validation cho form cập nhật thông tin cá nhân (Profile)
 */
export const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.email("Email không hợp lệ").nullable().or(z.literal("")).optional(),
  phoneNumber: z.string().nullable().or(z.literal("")).optional(),
  birthday: z.string().nullable().or(z.literal("")).optional(),
  gender: z.enum(["MALE", "FEMALE"], "Giới tính không hợp lệ"),
  cccd: z.string().nullable().or(z.literal("")).optional(),
  currentAddress: z.string().nullable().or(z.literal("")).optional(),
  hometown: z.string().nullable().or(z.literal("")).optional(),
  placeOfBirth: z.string().nullable().or(z.literal("")).optional(),
  ethnicity: z.string().nullable().or(z.literal("")).optional(),
  religion: z.string().nullable().or(z.literal("")).optional(),
  rank: z.string().nullable().or(z.literal("")).optional(),
  unit: z.string().nullable().or(z.literal("")).optional(),
  positionGovernment: z.string().nullable().or(z.literal("")).optional(),
  positionParty: z.string().nullable().or(z.literal("")).optional(),
  startWork: z.number().nullable().optional(),
  dateOfEnlistment: z.string().nullable().or(z.literal("")).optional(),
  probationaryPartyMember: z.string().nullable().or(z.literal("")).optional(),
  fullPartyMember: z.string().nullable().or(z.literal("")).optional(),
  partyMemberCardNumber: z.string().nullable().or(z.literal("")).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const studentProfileSchema = z.object({
  code: z.string().min(1, "Mã học viên không được để trống"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.email("Email không hợp lệ").nullable().or(z.literal("")).optional(),
  phoneNumber: z.string().nullable().or(z.literal("")).optional(),
  birthday: z.string().nullable().or(z.literal("")).optional(),
  gender: z.enum(["MALE", "FEMALE"], "Giới tính không hợp lệ"),
  cccd: z.string().nullable().or(z.literal("")).optional(),
  currentAddress: z.string().nullable().or(z.literal("")).optional(),
  hometown: z.string().nullable().or(z.literal("")).optional(),
  placeOfBirth: z.string().nullable().or(z.literal("")).optional(),
  ethnicity: z.string().nullable().or(z.literal("")).optional(),
  religion: z.string().nullable().or(z.literal("")).optional(),
  rank: z.string().nullable().or(z.literal("")).optional(),
  unit: z.string().nullable().or(z.literal("")).optional(),
  positionGovernment: z.string().nullable().or(z.literal("")).optional(),
  positionParty: z.string().nullable().or(z.literal("")).optional(),
  dateOfEnlistment: z.string().nullable().or(z.literal("")).optional(),
  enrollment: z.number().nullable().optional(),
  currentCpa4: z
    .number()
    .min(0, "CPA hệ 4 không được âm")
    .max(4, "CPA hệ 4 tối đa là 4")
    .nullable()
    .optional(),
  currentCpa10: z
    .number()
    .min(0, "CPA hệ 10 không được âm")
    .max(10, "CPA hệ 10 tối đa là 10")
    .nullable()
    .optional(),
  graduationDate: z.string().nullable().or(z.literal("")).optional(),
  partyMemberCardNumber: z.string().nullable().or(z.literal("")).optional(),
  probationaryPartyMember: z.string().nullable().or(z.literal("")).optional(),
  fullPartyMember: z.string().nullable().or(z.literal("")).optional(),
  familyMember: z.string().nullable().or(z.literal("")).optional(),
  foreignRelations: z.string().nullable().or(z.literal("")).optional(),
});

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

/**
 * Schema validation cho form thêm đơn vị (Organization)
 */
export const createOrganizationSchema = z.object({
  organizationName: z.string().min(1, "Tên đơn vị là bắt buộc"),
  travelTime: z.number().min(0, "Thời gian di chuyển không được âm"),
  universityId: z.string().min(1, "University ID là bắt buộc"),
});

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;

/**
 * Schema validation cho form cập nhật đơn vị (Organization)
 */
export const updateOrganizationSchema = z.object({
  organizationName: z.string().min(1, "Tên đơn vị là bắt buộc"),
  travelTime: z.number().min(0, "Thời gian di chuyển không được âm"),
});

export type UpdateOrganizationFormValues = z.infer<
  typeof updateOrganizationSchema
>;

/**
 * Schema validation cho form thêm trình độ (EducationLevel)
 */
export const createEducationLevelSchema = z.object({
  levelName: z.string().min(1, "Tên trình độ là bắt buộc"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

export type CreateEducationLevelFormValues = z.infer<
  typeof createEducationLevelSchema
>;

/**
 * Schema validation cho form cập nhật trình độ (EducationLevel)
 */
export const updateEducationLevelSchema = z.object({
  levelName: z.string().min(1, "Tên trình độ là bắt buộc"),
});

export type UpdateEducationLevelFormValues = z.infer<
  typeof updateEducationLevelSchema
>;

/**
 * Schema validation cho form thêm lớp học (Class)
 */
export const createClassSchema = z.object({
  className: z.string().min(1, "Tên lớp là bắt buộc"),
  educationLevelId: z.string().min(1, "Education Level ID là bắt buộc"),
});

export type CreateClassFormValues = z.infer<typeof createClassSchema>;

/**
 * Schema validation cho form cập nhật lớp học (Class)
 */
export const updateClassSchema = z.object({
  className: z.string().min(1, "Tên lớp là bắt buộc"),
  studentCount: z.number().min(0, "Số lượng học viên không được âm"),
});

export type UpdateClassFormValues = z.infer<typeof updateClassSchema>;

/**
 * Schema validation cho form thêm học kỳ (Semester)
 */
export const createSemesterSchema = z.object({
  code: z.string().min(1, "Mã học kỳ là bắt buộc"),
  schoolYear: z.string().min(1, "Năm học là bắt buộc"),
});

export type CreateSemesterFormValues = z.infer<typeof createSemesterSchema>;

/**
 * Schema validation cho form cập nhật học kỳ (Semester)
 */
export const updateSemesterSchema = z.object({
  code: z.string().min(1, "Mã học kỳ là bắt buộc"),
  schoolYear: z.string().min(1, "Năm học là bắt buộc"),
});

export type UpdateSemesterFormValues = z.infer<typeof updateSemesterSchema>;

/**
 * Schema validation cho form học phí (Tuition Fee)
 */
export const tuitionFeeBaseSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên"),
  totalAmount: z.number("Số tiền không hợp lệ").min(0, "Số tiền không được âm"),
  semester: z.string().min(1, "Học kỳ là bắt buộc"),
  schoolYear: z.string().min(1, "Năm học là bắt buộc"),
  content: z.string().min(1, "Nội dung học phí là bắt buộc"),
  status: z.enum(["PAID", "UNPAID"], "Trạng thái thanh toán không hợp lệ"),
});

export const createTuitionFeeSchema = tuitionFeeBaseSchema;
export type CreateTuitionFeeFormValues = z.infer<typeof createTuitionFeeSchema>;

export const updateTuitionFeeSchema = tuitionFeeBaseSchema;
export type UpdateTuitionFeeFormValues = z.infer<typeof updateTuitionFeeSchema>;

export const achievementBaseSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên"),
  title: z.string().min(1, "Tên thành tích là bắt buộc"),
  award: z.string().nullable().or(z.literal("")).optional(),
  semester: z.string().nullable().or(z.literal("")).optional(),
  schoolYear: z.string().nullable().or(z.literal("")).optional(),
  year: z.number().nullable().optional(),
  content: z.string().nullable().or(z.literal("")).optional(),
  description: z.string().nullable().or(z.literal("")).optional(),
});

export const createAchievementSchema = achievementBaseSchema;
export type CreateAchievementFormValues = z.infer<
  typeof createAchievementSchema
>;

export const updateAchievementSchema = achievementBaseSchema;
export type UpdateAchievementFormValues = z.infer<
  typeof updateAchievementSchema
>;

/**
 * Schema validation cho form phân công lịch trực (Duty Schedule)
 */
export const createDutyScheduleSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên trực"),
  position: z.string().min(1, "Nhiệm vụ không được để trống"),
  workDay: z.string().min(1, "Ngày trực không được để trống"),
});

export type CreateDutyScheduleFormValues = z.infer<
  typeof createDutyScheduleSchema
>;

/**
 * Schema validation cho form cập nhật lịch trực (Duty Schedule)
 */
export const updateDutyScheduleSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên trực"),
  position: z.string().min(1, "Nhiệm vụ không được để trống"),
  workDay: z.string().min(1, "Ngày trực không được để trống"),
});

export type UpdateDutyScheduleFormValues = z.infer<
  typeof updateDutyScheduleSchema
>;

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleItemSchema = z.object({
  day: z.string().min(1, "Ngày học là bắt buộc"),
  timeRange: z.object({
    startTime: z.string().regex(timePattern, "Giờ bắt đầu không hợp lệ"),
    endTime: z.string().regex(timePattern, "Giờ kết thúc không hợp lệ"),
  }),
  room: z.string().min(1, "Phòng học là bắt buộc"),
  subjectName: z.string().min(1, "Môn học là bắt buộc"),
  week: z
    .array(
      z
        .number()
        .int("Tuần học phải là số nguyên")
        .min(1, "Tuần học phải lớn hơn 0")
        .max(60, "Tuần học tối đa là 60")
    )
    .default([]),
});

export const createTimeTableSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên"),
  semesterId: z.string().min(1, "Vui lòng chọn học kỳ"),
  schedules: z.array(scheduleItemSchema).default([]),
});

export type CreateTimeTableFormValues = z.input<typeof createTimeTableSchema>;

export const updateTimeTableSchema = createTimeTableSchema;

export type UpdateTimeTableFormValues = z.input<typeof updateTimeTableSchema>;

const mealSlotsSchema = z.object({
  morning: z.boolean().optional(),
  noon: z.boolean().optional(),
  evening: z.boolean().optional(),
});

export const cutRiceWeeklySchema = z.record(z.string(), mealSlotsSchema);

export const createCutRiceSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn học viên"),
  weekly: cutRiceWeeklySchema.default({}),
  isAutoGenerated: z.boolean().default(false),
  notes: z.string().max(255, "Ghi chú tối đa 255 ký tự").optional().nullable(),
});

export type CreateCutRiceFormValues = z.infer<typeof createCutRiceSchema>;

export const updateCutRiceSchema = createCutRiceSchema;

export type UpdateCutRiceFormValues = z.infer<typeof updateCutRiceSchema>;

export const createGradeRequestSchema = z.object({
  subjectResultId: z.string().min(1, "Vui lòng chọn môn học"),
  requestType: z.enum(
    ["ADD", "UPDATE", "DELETE"],
    "Vui lòng chọn loại đề xuất"
  ),
  proposedGradePoint10: z
    .number()
    .min(0, "Điểm đề xuất phải lớn hơn hoặc bằng 0")
    .max(10, "Điểm đề xuất phải nhỏ hơn hoặc bằng 10"),
  attachmentUrl: z
    .string()
    .max(500, "Minh chứng tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  reason: z.string().min(1, "Vui lòng nhập lý do đề xuất"),
});

export type CreateGradeRequestFormValues = z.infer<
  typeof createGradeRequestSchema
>;
