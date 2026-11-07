"use client";

import {
  AiOutlineBank,
  AiOutlineCalendar,
  AiOutlineCheckSquare,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineGift,
  AiOutlineIdcard,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineRead,
  AiOutlineTeam,
  AiOutlineThunderbolt,
} from "@/library/icons";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/accounts/user";
import { QUERY_KEYS } from "@/constants/query-keys";
import { formatDateTime, formatDate } from "@/utils/fn-common";
import { ROLES } from "@/constants/constants";
import Typography from "@/library/Typography";
import Badge from "@/library/Badge";
import DetailUserSkeleton from "./DetailUserSkeleton";
import Avatar from "@/library/Avatar";
import { UserDetailResponse } from "@/types/accounts/user";
import {
  FamilyMembersView,
  ForeignRelationsView,
} from "@/components/profiles/shared/ProfileRelationsView";

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
  const trainingSystemCode = user.trainingSystem?.code || user.TrainingSystem?.code;

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
            <Badge variant="secondary">
              {user.role === "ADMIN" ? "Toàn hệ thống" : trainingSystemCode ? trainingSystemCode.replace("HE_", "Hệ ") : "Chưa gán hệ"}
            </Badge>
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
              icon={<AiOutlineIdcard />}
              label="Tên đăng nhập"
              value={user.username}
            />
            <DetailItem
              icon={<AiOutlineClockCircle />}
              label="Ngày tạo"
              value={formatDateTime(user.createdAt)}
            />
            <DetailItem
              icon={<AiOutlineClockCircle />}
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
              icon={<AiOutlineMail />}
              label="Email"
              value={user.profile?.email}
            />
            <DetailItem
              icon={<AiOutlinePhone />}
              label="Số điện thoại"
              value={user.profile?.phoneNumber || "Chưa cập nhật"}
            />
            <DetailItem
              icon={<AiOutlineEnvironment />}
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
                    icon={<AiOutlineGift />}
                    label="Ngày sinh"
                    value={formatDate(user.profile.birthday)}
                  />
                  <DetailItem
                    icon={<AiOutlineTeam />}
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
                  icon={<AiOutlineIdcard />}
                  label="Số CCCD"
                  value={user.profile.cccd}
                />
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<AiOutlineEnvironment />}
                    label="Quê quán"
                    value={user.profile.hometown}
                  />
                  <DetailItem
                    icon={<AiOutlineEnvironment />}
                    label="Nơi sinh"
                    value={user.profile.placeOfBirth}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<AiOutlineThunderbolt />}
                    label="Dân tộc"
                    value={user.profile.ethnicity}
                  />
                  <DetailItem
                    icon={<AiOutlineThunderbolt />}
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
                    icon={<AiOutlineCheckSquare />}
                    label="Cấp bậc"
                    value={user.profile.rank}
                  />
                  {user.role === "STUDENT" && (
                    <DetailItem
                      icon={<AiOutlineBank />}
                      label="Khóa"
                      value={user.profile.enrollment}
                    />
                  )}
                  {user.role === "COMMANDER" && (
                    <DetailItem
                      icon={<AiOutlineBank />}
                      label="Năm công tác"
                      value={user.profile.startWork}
                    />
                  )}
                  <DetailItem
                    icon={<AiOutlineBank />}
                    label="Đơn vị"
                    value={user.profile.unit}
                  />
                  <DetailItem
                    icon={<AiOutlineRead />}
                    label="Chức vụ chính quyền"
                    value={user.profile.positionGovernment}
                  />
                </div>

                {user.role === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      icon={<AiOutlineBank />}
                      label="Trường đại học"
                      value={user.profile.university?.universityName}
                    />
                    <DetailItem
                      icon={<AiOutlineTeam />}
                      label="Lớp"
                      value={user.profile.class?.className}
                    />
                    <DetailItem
                      icon={<AiOutlineBank />}
                      label="Ngành"
                      value={user.profile.organization?.organizationName}
                    />
                    <DetailItem
                      icon={<AiOutlineRead />}
                      label="Trình độ đào tạo"
                      value={user.profile.educationLevel?.levelName}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<AiOutlineCalendar />}
                    label="Ngày nhập ngũ"
                    value={formatDate(user.profile.dateOfEnlistment)}
                  />
                  {user.role === "STUDENT" && (
                    <DetailItem
                      icon={<AiOutlineCalendar />}
                      label="Ngày tốt nghiệp"
                      value={formatDate(user.profile.graduationDate)}
                    />
                  )}
                </div>

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
                    icon={<AiOutlineCheckSquare />}
                    label="Chức vụ Đảng"
                    value={user.profile.positionParty || "Chưa có"}
                  />
                  <DetailItem
                    icon={<AiOutlineIdcard />}
                    label="Số thẻ Đảng"
                    value={user.profile.partyMemberCardNumber || "Chưa có"}
                  />
                </div>
                <div className="space-y-4">
                  <DetailItem
                    icon={<AiOutlineCalendar />}
                    label="Vào Đảng (dự bị)"
                    value={formatDate(user.profile.probationaryPartyMember)}
                  />
                  <DetailItem
                    icon={<AiOutlineCalendar />}
                    label="Vào Đảng (chính thức)"
                    value={formatDate(user.profile.fullPartyMember)}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Typography
                      variant="caption"
                      color="gray"
                      className="mb-2 block"
                    >
                      Thông tin gia đình
                    </Typography>
                    <FamilyMembersView members={user.profile.familyMember} />
                  </div>
                  <div>
                    <Typography
                      variant="caption"
                      color="gray"
                      className="mb-2 block"
                    >
                      Yếu tố nước ngoài
                    </Typography>
                    <ForeignRelationsView
                      relations={user.profile.foreignRelations}
                    />
                  </div>
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
