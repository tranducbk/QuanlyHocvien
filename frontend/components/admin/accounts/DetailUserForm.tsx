"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { QUERY_KEYS } from "@/constants/query-keys";
import { formatDateTime, formatDate } from "@/utils/fn-common";
import { ROLES } from "@/constants/constants";
import Typography from "@/library/Typography";
import Badge from "@/library/Badge";
import DetailUserSkeleton from "./DetailUserSkeleton";
import Avatar from "@/library/Avatar";
import {
  HiOutlineMail,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineCake,
  HiOutlineLibrary,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { UserDetailResponse } from "@/types/user";

interface DetailUserFormProps {
  userId: string;
  initialData: UserDetailResponse;
}

const DetailUserForm: React.FC<DetailUserFormProps> = ({
  userId,
  initialData,
}) => {
  const {
    data: response,
    isPending,
    isPlaceholderData,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.USERS, userId],
    queryFn: () => userService.getUserById(userId),
    placeholderData: initialData
      ? { data: initialData, statusCode: 200, message: "Initial" }
      : undefined,
  });

  const user = response?.data;

  if (isPending && !isPlaceholderData) {
    return <DetailUserSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="py-10 text-center">
        <Typography color="error">Đã có lỗi xảy ra khi tải dữ liệu.</Typography>
      </div>
    );
  }

  const roleInfo = ROLES[user.role as keyof typeof ROLES];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
        <Avatar
          src={user.profile?.avatar}
          alt={user.profile?.fullName || user.username}
          size={64}
          iconSize={32}
        />
        <div>
          <Typography variant="h2" weight="bold">
            {user.profile?.fullName || user.username}
          </Typography>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user.isActive ? "success" : "error"}>
              {user.isActive ? "Đang hoạt động" : "Đã khóa"}
            </Badge>
            <Badge variant="primary">{roleInfo?.NAME || user.role}</Badge>
            {user.profile && (
              <Badge variant="neutral">{user.profile.code}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Section */}
        <section className="space-y-4">
          <Typography
            variant="label"
            weight="black"
            transform="uppercase"
            color="primary"
            tracking="widest"
          >
            Thông tin tài khoản
          </Typography>

          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <DetailItem
              icon={<HiOutlineIdentification />}
              label="Tên đăng nhập"
              value={user.username}
            />
            <DetailItem
              icon={<HiOutlineClock />}
              label="Ngày tạo"
              value={formatDateTime(user.createdAt)}
            />
            <DetailItem
              icon={<HiOutlineClock />}
              label="Cập nhật cuối"
              value={formatDateTime(user.updatedAt)}
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-4">
          <Typography
            variant="label"
            weight="black"
            transform="uppercase"
            color="primary"
            tracking="widest"
          >
            Thông tin liên hệ
          </Typography>

          <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <DetailItem
              icon={<HiOutlineMail />}
              label="Email"
              value={user.profile?.email}
            />
            <DetailItem
              icon={<HiOutlinePhone />}
              label="Số điện thoại"
              value={user.profile?.phoneNumber || "Chưa cập nhật"}
            />
            <DetailItem
              icon={<HiOutlineLocationMarker />}
              label="Địa chỉ hiện tại"
              value={user.profile?.currentAddress || "Chưa cập nhật"}
            />
          </div>
        </section>

        {/* Profile Data */}
        {user.profile && (
          <>
            {/* Personal Info Section */}
            <section className="space-y-4">
              <Typography
                variant="label"
                weight="black"
                transform="uppercase"
                color="primary"
                tracking="widest"
              >
                Thông tin cá nhân
              </Typography>

              <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<HiOutlineCake />}
                    label="Ngày sinh"
                    value={formatDate(user.profile.birthday)}
                  />
                  <DetailItem
                    icon={<HiOutlineUserGroup />}
                    label="Giới tính"
                    value={
                      user.profile.gender
                        ? user.profile.gender === "MALE"
                          ? "Nam"
                          : "Nữ"
                        : null
                    }
                  />
                </div>
                <DetailItem
                  icon={<HiOutlineIdentification />}
                  label="Số CCCD"
                  value={user.profile.cccd}
                />
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<HiOutlineLocationMarker />}
                    label="Quê quán"
                    value={user.profile.hometown}
                  />
                  <DetailItem
                    icon={<HiOutlineLocationMarker />}
                    label="Nơi sinh"
                    value={user.profile.placeOfBirth}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<HiOutlineSparkles />}
                    label="Dân tộc"
                    value={user.profile.ethnicity}
                  />
                  <DetailItem
                    icon={<HiOutlineSparkles />}
                    label="Tôn giáo"
                    value={user.profile.religion}
                  />
                </div>
              </div>
            </section>

            {/* Work & Position Section */}
            <section className="space-y-4">
              <Typography
                variant="label"
                weight="black"
                transform="uppercase"
                color="primary"
                tracking="widest"
              >
                {user.role === "STUDENT"
                  ? "Học tập & Công tác"
                  : "Công tác & Chức vụ"}
              </Typography>

              <div className="space-y-4 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<HiOutlineBadgeCheck />}
                    label="Cấp bậc"
                    value={user.profile.rank}
                  />
                  {user.role === "STUDENT" && (
                    <DetailItem
                      icon={<HiOutlineLibrary />}
                      label="Khóa"
                      value={user.profile.enrollment}
                    />
                  )}
                  {user.role === "COMMANDER" && (
                    <DetailItem
                      icon={<HiOutlineLibrary />}
                      label="Năm công tác"
                      value={user.profile.startWork}
                    />
                  )}
                  <DetailItem
                    icon={<HiOutlineOfficeBuilding />}
                    label="Đơn vị"
                    value={user.profile.unit}
                  />
                  <DetailItem
                    icon={<HiOutlineAcademicCap />}
                    label="Chức vụ chính quyền"
                    value={user.profile.positionGovernment}
                  />
                </div>

                {user.role === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      icon={<HiOutlineLibrary />}
                      label="Trường đại học"
                      value={user.profile.university?.universityName}
                    />
                    <DetailItem
                      icon={<HiOutlineUserGroup />}
                      label="Lớp"
                      value={user.profile.class?.className}
                    />
                    <DetailItem
                      icon={<HiOutlineOfficeBuilding />}
                      label="Ngành"
                      value={user.profile.organization?.organizationName}
                    />
                    <DetailItem
                      icon={<HiOutlineAcademicCap />}
                      label="Trình độ đào tạo"
                      value={user.profile.educationLevel?.levelName}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<HiOutlineCalendar />}
                    label="Ngày nhập ngũ"
                    value={formatDate(user.profile.dateOfEnlistment)}
                  />
                  {user.role === "STUDENT" && (
                    <DetailItem
                      icon={<HiOutlineCalendar />}
                      label="Ngày tốt nghiệp"
                      value={formatDate(user.profile.graduationDate)}
                    />
                  )}
                </div>

                {user.role === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      icon={<HiOutlineChartBar />}
                      label="CPA (Hệ 4)"
                      value={user.profile.currentCpa4}
                    />
                    <DetailItem
                      icon={<HiOutlineChartBar />}
                      label="CPA (Hệ 10)"
                      value={user.profile.currentCpa10}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Political & Background Section */}
            <section className="md:col-span-2 space-y-4">
              <Typography
                variant="label"
                weight="black"
                transform="uppercase"
                color="primary"
                tracking="widest"
              >
                Đảng & Đoàn - Quan hệ
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-neutral-50/30 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="space-y-4">
                  <DetailItem
                    icon={<HiOutlineBadgeCheck />}
                    label="Chức vụ Đảng"
                    value={user.profile.positionParty || "Chưa có"}
                  />
                  <DetailItem
                    icon={<HiOutlineIdentification />}
                    label="Số thẻ Đảng"
                    value={user.profile.partyMemberCardNumber || "Chưa có"}
                  />
                </div>
                <div className="space-y-4">
                  <DetailItem
                    icon={<HiOutlineCalendar />}
                    label="Vào Đảng (dự bị)"
                    value={formatDate(user.profile.probationaryPartyMember)}
                  />
                  <DetailItem
                    icon={<HiOutlineCalendar />}
                    label="Vào Đảng (chính thức)"
                    value={formatDate(user.profile.fullPartyMember)}
                  />
                </div>
                <div className="space-y-4">
                  <DetailItem
                    icon={<HiOutlineUserGroup />}
                    label="Thành phần gia đình"
                    value={user.profile.familyMember || "Chưa cập nhật"}
                  />
                  <DetailItem
                    icon={<HiOutlineLibrary />}
                    label="Quan hệ nước ngoài"
                    value={user.profile.foreignRelations || "Không có"}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}> = ({ icon, label, value }) => (
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

export default DetailUserForm;
