"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import { UserDetailResponse, UpdateProfileRequest } from "@/types/accounts/user";
import { userService } from "@/services/accounts/user";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import useAppMutation from "@/hooks/useAppMutation";

interface UpdateUserFormProps {
  user: UserDetailResponse;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ user }) => {
  const { closeModal } = useModalStore();
  const profile = user.profile || user.Profile;
  const initialSystemCode = user.trainingSystem?.code || user.TrainingSystem?.code || "";
  const [username, setUsername] = useState(user.username);
  const [trainingSystemCode, setTrainingSystemCode] = useState(initialSystemCode);
  const [commanderId, setCommanderId] = useState(profile?.commanderId || "");

  const commandersQuery = useQuery({
    queryKey: [QUERY_KEYS.USERS, "commanders", trainingSystemCode],
    queryFn: () => userService.getAllUsers({ role: "COMMANDER", trainingSystemCode, fetchAll: true }),
    enabled: user.role === "STUDENT" && Boolean(trainingSystemCode),
  });

  const updateMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.UPDATE_USER,
    mutationFn: (data: UpdateProfileRequest) => userService.updateUser(user.id, data),
    invalidateQueryKey: [QUERY_KEYS.USERS],
    successMessage: "Cập nhật tài khoản thành công",
    errorMessage: "Cập nhật tài khoản thất bại",
    onSuccess: () => closeModal(),
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: UpdateProfileRequest = {};
    if (username.trim() !== user.username) data.username = username.trim();
    if (user.role !== "ADMIN" && trainingSystemCode !== initialSystemCode) {
      data.trainingSystemCode = trainingSystemCode;
    }
    if (user.role === "STUDENT" && (commanderId || "") !== (profile?.commanderId || "")) {
      data.commanderId = commanderId || null;
    }
    if (Object.keys(data).length) updateMutation.mutate(data);
  };

  const commanderOptions = [
    { value: "", label: "Chưa gán" },
    ...(commandersQuery.data?.data || []).map((item) => ({
      value: item.id,
      label: item.profile?.fullName || item.Profile?.fullName || item.username,
    })),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Tên đăng nhập"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      {user.role !== "ADMIN" && (
        <Select
          label="Hệ đào tạo"
          options={[1, 3, 4, 5, 7].map((number) => ({ value: `HE_${number}`, label: `Hệ ${number}` }))}
          value={trainingSystemCode}
          onChange={(value) => {
            setTrainingSystemCode(String(value));
            setCommanderId("");
          }}
          required
        />
      )}
      {user.role === "STUDENT" && (
        <Select
          label="Chỉ huy quản lý"
          options={commanderOptions}
          value={commanderId}
          onChange={(value) => setCommanderId(String(value))}
          isLoading={commandersQuery.isLoading}
        />
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>Hủy</Button>
        <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>Lưu thay đổi</Button>
      </div>
    </form>
  );
};

export default UpdateUserForm;
