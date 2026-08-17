"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "@/utils/validations";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { authService } from "@/services/auth";
import { ChangePasswordRequest } from "@/types/auth";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";
import { MUTATION_KEYS } from "@/constants/query-keys";

const ChangePasswordForm: React.FC = () => {
  const { closeModal } = useModalStore();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const changePasswordMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CHANGE_PASSWORD,
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    successMessage: "Đổi mật khẩu thành công!",
    errorMessage: "Đổi mật khẩu thất bại. Vui lòng thử lại!",
    onSuccess: () => closeModal(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
      <Input
        label="Mật khẩu cũ"
        type={showOldPassword ? "text" : "password"}
        placeholder="Nhập mật khẩu hiện tại"
        isLoading={changePasswordMutation.isPending}
        prefixIcon={<HiOutlineLockClosed size={18} />}
        suffixIcon={
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
          >
            {showOldPassword ? (
              <HiOutlineEyeOff size={18} />
            ) : (
              <HiOutlineEye size={18} />
            )}
          </button>
        }
        error={errors.oldPassword?.message}
        {...register("oldPassword")}
        required={true}
      />

      <Input
        label="Mật khẩu mới"
        type={showNewPassword ? "text" : "password"}
        placeholder="Nhập mật khẩu mới"
        isLoading={changePasswordMutation.isPending}
        required={true}
        prefixIcon={<HiOutlineLockClosed size={18} />}
        suffixIcon={
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <HiOutlineEyeOff size={18} />
            ) : (
              <HiOutlineEye size={18} />
            )}
          </button>
        }
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <Input
        label="Xác nhận mật khẩu mới"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Nhập lại mật khẩu mới"
        isLoading={changePasswordMutation.isPending}
        prefixIcon={<HiOutlineLockClosed size={18} />}
        suffixIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <HiOutlineEyeOff size={18} />
            ) : (
              <HiOutlineEye size={18} />
            )}
          </button>
        }
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
        required={true}
      />

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={closeModal}
          isLoading={changePasswordMutation.isPending}
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          isLoading={changePasswordMutation.isPending}
          disabled={!isDirty}
        >
          Cập nhật mật khẩu
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
