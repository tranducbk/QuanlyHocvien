"use client";

import {
  AiOutlineBank,
  AiOutlineBarChart,
  AiOutlineCalendar,
  AiOutlineCheckSquare,
  AiOutlineEnvironment,
  AiOutlineIdcard,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineRead,
  AiOutlineTeam,
} from "@/library/icons";

import { useQuery } from "@tanstack/react-query";
import Avatar from "@/library/Avatar";
import Badge from "@/library/Badge";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { userService } from "@/services/accounts/user";
import { Student } from "@/types/accounts/user";
import { formatDate, formatDateTime } from "@/utils/fn-common";
import {
  FamilyMembersView,
  ForeignRelationsView,
} from "@/components/profiles/shared/ProfileRelationsView";

interface StudentProfileDetailProps {
  studentId: string;
  initialData: Student;
  militaryMode?: boolean;
}

export default function StudentProfileDetail({
  studentId,
  initialData,
  militaryMode = false,
}: StudentProfileDetailProps) {
  const {
    data: response,
    isPending,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROFILES, studentId],
    queryFn: () => userService.getStudentProfileById(studentId),
    placeholderData: { data: initialData, statusCode: 200, message: "Initial" },
  });

  const student = response?.data;

  if (isPending && !student) {
    return (
      <div className="py-10 text-center">
        <Typography color="gray">Đang tải hồ sơ học viên...</Typography>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="py-10 text-center">
        <Typography color="error">Không tải được hồ sơ học viên.</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <Avatar src={student.avatar} alt={student.fullName} size={72} />
        <div className="min-w-0">
          <Typography variant="h2" weight="bold" className="wrap-break-word">
            {student.fullName || "Chưa cập nhật"}
          </Typography>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="primary">{student.code || "Chưa có mã"}</Badge>
            <Badge variant="neutral">{student.rank || "Học viên"}</Badge>
            <Badge variant="secondary">
              {(militaryMode ? student.militaryClass?.className : student.managementClass?.status === "GRADUATED" ? "Tốt nghiệp" : student.managementClass?.name) || "Chưa phân lớp"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailSection title="Thông tin cơ bản">
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Ngày sinh"
            value={formatDate(student.birthday)}
          />
          <DetailItem
            icon={<AiOutlineTeam />}
            label="Giới tính"
            value={student.gender === "MALE" ? "Nam" : "Nữ"}
          />
          <DetailItem
            icon={<AiOutlineIdcard />}
            label="Số CCCD"
            value={student.cccd}
          />
          <DetailItem
            icon={<AiOutlinePhone />}
            label="Số điện thoại"
            value={student.phoneNumber}
          />
          <DetailItem
            icon={<AiOutlineMail />}
            label="Email"
            value={student.email}
          />
          <DetailItem
            icon={<AiOutlineEnvironment />}
            label="Địa chỉ hiện tại"
            value={student.currentAddress}
          />
          <DetailItem
            icon={<AiOutlineEnvironment />}
            label="Quê quán"
            value={student.hometown}
          />
          <DetailItem
            icon={<AiOutlineEnvironment />}
            label="Nơi sinh"
            value={student.placeOfBirth}
          />
        </DetailSection>

        <DetailSection title="Thông tin học tập">
          {militaryMode && <DetailItem icon={<AiOutlineRead />} label="Lớp quân sự" value={student.militaryClass?.className || student.militaryClass?.classCode} />}
          {!militaryMode && <>
          <DetailItem
            icon={<AiOutlineBank />}
            label="Mã trường"
            value={student.university?.universityCode}
          />
          <DetailItem
            icon={<AiOutlineRead />}
            label="Lớp học"
            value={student.managementClass?.status === "GRADUATED" ? "Tốt nghiệp" : student.managementClass?.name}
          />
          <DetailItem
            icon={<AiOutlineRead />}
            label="Trình độ"
            value={student.educationLevel?.levelName}
          />
          </>}
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Khóa nhập học"
            value={student.enrollment}
          />
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Ngày tốt nghiệp"
            value={formatDate(student.graduationDate)}
          />
          <DetailItem
            icon={<AiOutlineBarChart />}
            label="CPA hệ 4"
            value={student.currentCpa4}
          />
          <DetailItem
            icon={<AiOutlineBarChart />}
            label="CPA hệ 10"
            value={student.currentCpa10}
          />
        </DetailSection>

        <DetailSection title="Quân nhân & chính trị">
          <DetailItem
            icon={<AiOutlineCheckSquare />}
            label="Cấp bậc"
            value={student.rank}
          />
          {militaryMode && <DetailItem
            icon={<AiOutlineBank />}
            label="Đơn vị quân nhân"
            value={student.unit}
          />}
          <DetailItem
            icon={<AiOutlineRead />}
            label="Chức vụ chính quyền"
            value={student.positionGovernment}
          />
          <DetailItem
            icon={<AiOutlineRead />}
            label="Chức vụ Đảng"
            value={student.positionParty}
          />
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Ngày nhập ngũ"
            value={formatDate(student.dateOfEnlistment)}
          />
          <DetailItem
            icon={<AiOutlineIdcard />}
            label="Số thẻ Đảng"
            value={student.partyMemberCardNumber}
          />
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Vào Đảng dự bị"
            value={formatDate(student.probationaryPartyMember)}
          />
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Vào Đảng chính thức"
            value={formatDate(student.fullPartyMember)}
          />
        </DetailSection>

        <DetailSection title="Gia đình & yếu tố nước ngoài">
          <div>
            <Typography variant="caption" color="gray" className="mb-2 block">
              Thông tin gia đình
            </Typography>
            <FamilyMembersView members={student.familyMember} />
          </div>
          <div>
            <Typography variant="caption" color="gray" className="mb-2 block">
              Yếu tố nước ngoài
            </Typography>
            <ForeignRelationsView relations={student.foreignRelations} />
          </div>
        </DetailSection>

        <DetailSection title="Thông tin hệ thống">
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Ngày tạo hồ sơ"
            value={formatDateTime(student.createdAt)}
          />
          <DetailItem
            icon={<AiOutlineCalendar />}
            label="Cập nhật cuối"
            value={formatDateTime(student.updatedAt)}
          />
        </DetailSection>
      </div>
    </div>
  );
}

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
    <Typography
      variant="label"
      weight="black"
      transform="uppercase"
      color="primary"
      tracking="widest"
    >
      {title}
    </Typography>
    <div className="space-y-4">{children}</div>
  </section>
);

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-neutral-400">{icon}</div>
    <div className="flex-1 min-w-0">
      <Typography
        variant="caption"
        color="gray"
        className="block leading-none mb-1"
      >
        {label}
      </Typography>
      <Typography
        variant="body"
        weight="semibold"
        className="block whitespace-pre-wrap wrap-break-word"
      >
        {value !== null && value !== undefined && value !== ""
          ? value
          : "Chưa cập nhật"}
      </Typography>
    </div>
  </div>
);
