"use client";

import { useRef, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
  HiOutlineFlag,
  HiOutlinePencil,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineLibrary,
  HiOutlineClock,
} from "react-icons/hi";
import Typography from "@/library/Typography";
import PageContainer from "@/library/PageContainer";
import Avatar from "@/library/Avatar";
import Badge from "@/library/Badge";
import { DEFAULT_VALUES } from "@/constants/constants";
import { formatDate, formatDateTime, textOrDash } from "@/utils/fn-common";
import { useModalStore } from "@/store/useModalStore";
import UpdateProfileForm from "./UpdateProfileForm";
import ProfileSkeleton from "./ProfileSkeleton";
import Button from "@/library/Button";
import { IconType } from "react-icons";
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
  const commander = profile?.profile;
  const shouldShowMissingProfile = !isLoading && !isError && (!profile || !commander);

  const avatarMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_AVATAR,
    mutationFn: authService.uploadAvatar,
    invalidateQueryKey: [QUERY_KEYS.PROFILE],
    successMessage: "Cập nhật ảnh đại diện thành công",
    errorMessage: "Cập nhật ảnh đại diện thất bại",
  });

  const handleUpdateProfile = () => {
    if (!commander) return;

    openModal({
      title: "Cập nhật hồ sơ cá nhân",
      content: <UpdateProfileForm initialData={commander} />,
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
        { label: "Trang chủ", href: "/commander" },
        { label: "Hồ sơ cá nhân" },
      ]}
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
      isError={isError || shouldShowMissingProfile}
      errorMessage={
        isError ? error.message : "Không tìm thấy thông tin hồ sơ"
      }
      onRetry={refetch}
      className="space-y-8"
    >
      {/* Header */}
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
              src={commander?.avatar}
              alt={commander?.fullName}
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
                {commander?.fullName || DEFAULT_VALUES.DEFAULT_COMMANDER_NAME}
              </Typography>
              <Badge variant="primary" className="h-6">
                {commander?.rank || "Chưa cập nhật"}
              </Badge>
            </div>

            <Typography
              variant="body"
              color="gray"
              className="flex items-center gap-2 font-medium"
            >
              <HiOutlineIdentification size={16} className="text-neutral-400" />
              Mã chỉ huy:{" "}
              <span className="font-bold text-neutral-800 dark:text-neutral-100">
                {textOrDash(commander?.code)}
              </span>
            </Typography>
            <Badge variant={profile?.isActive ? "success" : "error"}>
              {profile?.isActive ? "Đang hoạt động" : "Đã khóa"}
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
        {/* Cột trái: Thông tin cá nhân */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Thông tin cơ bản
              </Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={HiOutlineCalendar}
                label="Ngày sinh"
                value={formatDate(commander?.birthday)}
              />
              <InfoItem
                icon={HiOutlineUser}
                label="Giới tính"
                value={commander?.gender === "MALE" ? "Nam" : "Nữ"}
              />
              <InfoItem
                icon={HiOutlineIdentification}
                label="Số CCCD"
                value={commander?.cccd}
              />
              <InfoItem
                icon={HiOutlineMail}
                label="Email"
                value={commander?.email}
              />
              <InfoItem
                icon={HiOutlinePhone}
                label="Số điện thoại"
                value={commander?.phoneNumber}
              />
              <InfoItem
                icon={HiOutlineLocationMarker}
                label="Quê quán"
                value={commander?.hometown}
              />
              <InfoItem
                icon={HiOutlineLocationMarker}
                label="Nơi sinh"
                value={commander?.placeOfBirth}
              />
              <InfoItem
                icon={HiOutlineGlobeAlt}
                label="Dân tộc"
                value={commander?.ethnicity}
              />
              <InfoItem
                icon={HiOutlineLibrary}
                label="Tôn giáo"
                value={commander?.religion}
              />
              <InfoItem
                icon={HiOutlineLocationMarker}
                label="Địa chỉ hiện tại"
                value={commander?.currentAddress}
              />
            </div>
          </section>

          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-secondary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Công tác & Chính trị
              </Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={HiOutlineShieldCheck}
                label="Cấp bậc"
                value={commander?.rank}
              />
              <InfoItem
                icon={HiOutlineBriefcase}
                label="Đơn vị"
                value={commander?.unit}
              />
              <InfoItem
                icon={HiOutlineFlag}
                label="Chức vụ chính quyền"
                value={commander?.positionGovernment}
              />
              <InfoItem
                icon={HiOutlineFlag}
                label="Chức vụ Đảng"
                value={commander?.positionParty}
              />
              <InfoItem
                icon={HiOutlineCalendar}
                label="Ngày nhập ngũ"
                value={formatDateTime(commander?.dateOfEnlistment)}
              />
              <InfoItem
                icon={HiOutlineClock}
                label="Thâm niên (Năm)"
                value={commander?.startWork}
              />
            </div>
          </section>
        </div>

        {/* Cột phải: Thông tin bổ sung */}
        <div className="flex flex-col gap-8">
          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Thông tin Đảng viên
              </Typography>
            </div>

            <div className="flex flex-col gap-4">
              <InfoItem
                icon={HiOutlineShieldCheck}
                label="Số thẻ Đảng"
                value={commander?.partyMemberCardNumber}
              />
              <InfoItem
                icon={HiOutlineCalendar}
                label="Ngày vào Đảng (Dự bị)"
                value={formatDate(commander?.probationaryPartyMember)}
              />
              <InfoItem
                icon={HiOutlineCalendar}
                label="Ngày vào Đảng (Chính thức)"
                value={formatDate(commander?.fullPartyMember)}
              />
            </div>
          </section>

          <section className="bg-white/40 dark:bg-neutral-900/60 backdrop-blur-md border border-white/60 dark:border-neutral-800 rounded-4xl p-8 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-secondary-500 rounded-full" />
              <Typography variant="h3" weight="black" transform="uppercase">
                Dữ liệu hệ thống
              </Typography>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 dark:hover:bg-neutral-950/70 transition-colors">
                <Typography variant="body" color="gray" className="font-medium">
                  Ngày tham gia
                </Typography>
                <Typography
                  variant="body"
                  weight="bold"
                  className="text-neutral-800 dark:text-neutral-100"
                >
                  {formatDateTime(profile?.createdAt)}
                </Typography>
              </div>
              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/50 dark:hover:bg-neutral-950/70 transition-colors">
                <Typography variant="body" color="gray" className="font-medium">
                  Cập nhật cuối
                </Typography>
                <Typography
                  variant="body"
                  weight="bold"
                  className="text-neutral-800 dark:text-neutral-100"
                >
                  {formatDateTime(profile?.updatedAt)}
                </Typography>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
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
    <div className="flex flex-col">
      <Typography variant="label" color="gray" className="mb-0.5">
        {label}
      </Typography>
      <Typography variant="body" weight="semibold" className="text-neutral-800 dark:text-neutral-100">
        {textOrDash(value)}
      </Typography>
    </div>
  </div>
);
