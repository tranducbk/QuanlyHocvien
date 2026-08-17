"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import { authService } from "@/services/auth";
import { userService } from "@/services/user";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { CreateUserRequest } from "@/types/auth";
import { createUserSchema, CreateUserFormValues } from "@/utils/validations";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

const CreateSingleUser: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { closeModal } = useModalStore()

  const commandersQuery = useQuery({
    queryKey: [QUERY_KEYS.USERS, "commanders"],
    queryFn: () => userService.getAllUsers({ role: "COMMANDER", fetchAll: true }),
  });

  const commanderOptions = React.useMemo(() => {
    const rows = commandersQuery.data?.data || [];
    return [
      { value: "", label: "Chưa gán" },
      ...rows.map((item) => ({
        value: item.id,
        label: item.profile?.fullName || item.Profile?.fullName || item.username,
      })),
    ];
  }, [commandersQuery.data?.data]);

  const createMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_USER,
    mutationFn: (userData: CreateUserRequest) => authService.register(userData),
    invalidateQueryKey: [QUERY_KEYS.USERS],
    successMessage: "Thêm người dùng thành công!",
    errorMessage: "Thêm thất bại!",
    onSuccess: () => closeModal(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: undefined,
      fullName: "",
      password: "",
      role: "STUDENT",
      commanderId: "",
    },
  });
  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = (data: CreateUserFormValues) => {
    createMutation.mutate({
      ...data,
      commanderId: data.role === "STUDENT" && data.commanderId ? data.commanderId : null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Họ và tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            {...register("fullName")}
            error={errors.fullName?.message}
            isLoading={createMutation.isPending}
            required={true}
          />
        </div>

        <Input
          label="Tên đăng nhập (Username)"
          placeholder="Ví dụ: nguyenvana"
          {...register("username")}
          error={errors.username?.message}
          isLoading={createMutation.isPending}
          required={true}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="Vai trò"
              options={[
                { value: "STUDENT", label: "Học viên" },
                { value: "COMMANDER", label: "Chỉ huy" },
                { value: "ADMIN", label: "Quản trị viên" },
              ]}
              error={errors.role?.message}
              value={field.value}
              onChange={field.onChange}
              isLoading={createMutation.isPending}
              required={true}
            />
          )}
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          {...register("password")}
          error={errors.password?.message}
          isLoading={createMutation.isPending}
          suffixIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          }
          required={true}
        />
        <Input
          label="Email"
          placeholder="Ví dụ: a.nguyen@gmail.com"
          {...register("email")}
          error={errors.email?.message}
          isLoading={createMutation.isPending}
        />
        {selectedRole === "STUDENT" && (
          <div className="md:col-span-2">
            <Controller
              name="commanderId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Chỉ huy quản lý"
                  placeholder="Chọn chỉ huy quản lý"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={commanderOptions}
                  error={errors.commanderId?.message}
                  isLoading={commandersQuery.isLoading || createMutation.isPending}
                />
              )}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-100 mt-6">
        <Button
          variant="ghost"
          type="button"
          onClick={() => closeModal()}
          disabled={createMutation.isPending}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={createMutation.isPending}
          disabled={!isDirty}
        >
          Tạo tài khoản
        </Button>
      </div>
    </form>
  );
};

export default CreateSingleUser;
