"use client";

import { useRef, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineGlobeAlt,
  HiOutlineIdentification,
  HiOutlineLibrary,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi";
import Typography from "@/library/Typography";
import PageContainer from "@/library/PageContainer";
import Avatar from "@/library/Avatar";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import { DEFAULT_VALUES } from "@/constants/constants";
import { formatDate, formatDateTime, textOrDash } from "@/utils/fn-common";
import { useModalStore } from "@/store/useModalStore";
import { IconType } from "react-icons";
import ProfileSkeleton from "@/components/commander/profile/ProfileSkeleton";
import UpdateProfileForm from "./UpdateProfileForm";
import useAppMutation from "@/hooks/useAppMutation";

export default function Main() {
  const { openModal } = useModalStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const {
    data: profileResponse,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: () => authService.getProfile(),
  });

  const profile = profileResponse?.data;
  const student = profile?.profile;
  const shouldShowMissingProfile = !isLoading && !isError && (!profile || !student);

  const avatarMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_AVATAR,
    mutationFn: authService.uploadAvatar,
    invalidateQueryKey: [QUERY_KEYS.PROFILE],
    successMessage: "Cập nhật ảnh đại diện thành công",
    errorMessage: "Cập nhật ảnh đại diện thất bại",
  });

  const handleUpdateProfile = () => {
    if (!student) return;
    openModal({
      title: "Cập nhật hồ sơ học viên",
      content: <UpdateProfileForm initialData={student} />,
      size: "lg",
      config: {
        mutationKey: MUTATION_KEYS.UPDATE_PROFILE,
      },
    });
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    avatarMutation.mutate(file);
  };

  return (
    <PageContainer
      breadcrumb={[
        { label: "Trang chủ", href: "/student" },
        { label: "Hồ sơ cá nhân" },
      ]}
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
      isError={isError || shouldShowMissingProfile}
      errorMessage={
        isError ? error.message : "Không tìm thấy thông tin hồ sơ học viên"
      }
      onRetry={() => refetch()}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/30 dark:bg-neutral-900/60 backdrop-blur-sm p-6 rounded-4xl border border-white/60 dark:border-neutral-800 shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group shrink-0">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Avatar
              src={student?.avatar}
              alt={student?.fullName}
              size={120}
              className="border-4 border-white dark:border-neutral-800 shadow-xl shadow-primary-900/10 dark:shadow-black/30"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarMutation.isPending}
              className="absolute bottom-1 right-1 size-10 rounded-full bg-primary-600 text-white flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-lg dark:shadow-black/30 hover:bg-primary-700 transition-all z-10"
            >
              <HiOutlinePencil size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <Typography
                variant="h1"
                weight="black"
                transform="uppercase"
                className="tracking-tight leading-none"
              >
                {student?.fullName || DEFAULT_VALUES.DEFAULT_STUDENT_NAME}
              </Typography>
              <Badge variant="primary" className="h-6">
                {student?.rank || "Học viên"}
              </Badge>
            </div>

            <Typography
              variant="body"
              color="gray"
              className="flex items-center gap-2 font-medium"
            >
              <HiOutlineIdentification size={16} className="text-neutral-400" />
              Mã học viên:{" "}
              <span className="font-bold text-neutral-800 dark:text-neutral-100">
                {textOrDash(student?.code)}
              </span>
            </Typography>
            <Badge variant={profile?.isActive ? "success" : "error"}>
              {profile?.isActive ? "Đang học tập" : "Đã khóa"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <Button
            onClick={handleUpdateProfile}
            variant="primary"
            className="px-8 py-4 rounded-2xl shadow-sm"
          >
            <HiOutlinePencil size={20} className="mr-2" />
            Cập nhật hồ sơ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ProfileSection title="Thông tin cơ bản" accent="bg-primary-500">
            <InfoItem icon={HiOutlineCalendar} label="Ngày sinh" value={formatDate(student?.birthday)} />
            <InfoItem icon={HiOutlineUser} label="Giới tính" value={student?.gender === "MALE" ? "Nam" : "Nữ"} />
            <InfoItem icon={HiOutlineIdentification} label="Số CCCD" value={student?.cccd} />
            <InfoItem icon={HiOutlineMail} label="Email" value={student?.email} />
            <InfoItem icon={HiOutlinePhone} label="Số điện thoại" value={student?.phoneNumber} />
            <InfoItem icon={HiOutlineLocationMarker} label="Quê quán" value={student?.hometown} />
            <InfoItem icon={HiOutlineLocationMarker} label="Nơi sinh" value={student?.placeOfBirth} />
            <InfoItem icon={HiOutlineGlobeAlt} label="Dân tộc" value={student?.ethnicity} />
            <InfoItem icon={HiOutlineLibrary} label="Tôn giáo" value={student?.religion} />
            <InfoItem icon={HiOutlineLocationMarker} label="Địa chỉ hiện tại" value={student?.currentAddress} />
          </ProfileSection>

          <ProfileSection title="Thông tin học tập" accent="bg-secondary-500">
            <InfoItem icon={HiOutlineOfficeBuilding} label="Trường đào tạo" value={student?.university?.universityName} />
            <InfoItem icon={HiOutlineUsers} label="Đơn vị" value={student?.organization?.organizationName} />
            <InfoItem icon={HiOutlineAcademicCap} label="Lớp học" value={student?.class?.className} />
            <InfoItem icon={HiOutlineAcademicCap} label="Trình độ" value={student?.educationLevel?.levelName} />
            <InfoItem icon={HiOutlineCalendar} label="Khóa nhập học" value={student?.enrollment} />
            <InfoItem icon={HiOutlineCalendar} label="Ngày tốt nghiệp" value={formatDate(student?.graduationDate)} />
            <InfoItem icon={HiOutlineAcademicCap} label="CPA hệ 4" value={student?.currentCpa4} />
            <InfoItem icon={HiOutlineAcademicCap} label="CPA hệ 10" value={student?.currentCpa10} />
          </ProfileSection>

          <ProfileSection title="Quân nhân & Chính trị" accent="bg-primary-500">
            <InfoItem icon={HiOutlineShieldCheck} label="Cấp bậc" value={student?.rank} />
            <InfoItem icon={HiOutlineFlag} label="Chức vụ chính quyền" value={student?.positionGovernment} />
            <InfoItem icon={HiOutlineFlag} label="Chức vụ Đảng" value={student?.positionParty} />
            <InfoItem icon={HiOutlineCalendar} label="Ngày nhập ngũ" value={formatDate(student?.dateOfEnlistment)} />
          </ProfileSection>
        </div>

        <div className="flex flex-col gap-8">
          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Thông tin Đảng viên
              </Typography>
            </div>

            <div className="flex flex-col gap-4">
              <InfoItem icon={HiOutlineShieldCheck} label="Số thẻ Đảng" value={student?.partyMemberCardNumber} />
              <InfoItem icon={HiOutlineCalendar} label="Ngày vào Đảng (Dự bị)" value={formatDate(student?.probationaryPartyMember)} />
              <InfoItem icon={HiOutlineCalendar} label="Ngày vào Đảng (Chính thức)" value={formatDate(student?.fullPartyMember)} />
            </div>
          </section>

          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-secondary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Quan hệ & hệ thống
              </Typography>
            </div>
            <div className="flex flex-col gap-4">
              <InfoItem icon={HiOutlineUsers} label="Quan hệ gia đình" value={student?.familyMember} />
              <InfoItem icon={HiOutlineGlobeAlt} label="Quan hệ nước ngoài" value={student?.foreignRelations} />
              <InfoItem icon={HiOutlineCalendar} label="Ngày tham gia" value={formatDateTime(profile?.createdAt)} />
              <InfoItem icon={HiOutlineCalendar} label="Cập nhật cuối" value={formatDateTime(profile?.updatedAt)} />
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

const ProfileSection = ({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) => (
  <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-2 h-8 ${accent} rounded-full`} />
      <Typography variant="h3" weight="black" transform="uppercase">
        {title}
      </Typography>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </section>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value?: string | number | null;
}) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/70 border border-neutral-100/50 dark:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-sm dark:hover:shadow-none transition-all group">
    <div className="size-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors shrink-0">
      <Icon size={20} />
    </div>
    <div className="flex flex-col min-w-0">
      <Typography variant="label" color="gray" className="mb-0.5">
        {label}
      </Typography>
      <Typography variant="body" weight="semibold" className="text-neutral-800 dark:text-neutral-100 break-words">
        {textOrDash(value)}
      </Typography>
    </div>
  </div>
);
