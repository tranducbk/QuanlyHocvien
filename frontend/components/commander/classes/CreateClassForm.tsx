"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createClassSchema, CreateClassFormValues } from "@/utils/validations";
import { classService } from "@/services/classes";
import { universityService } from "@/services/universities";
import { organizationService } from "@/services/organizations";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Select from "@/library/Select";
import Divide from "@/library/Divide";
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineAcademicCap,
  HiOutlineTag,
} from "react-icons/hi";
import useAppMutation from "@/hooks/useAppMutation";
import { useModalStore } from "@/store/useModalStore";

export default function CreateClassForm() {
  const { closeModal } = useModalStore();
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("");
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");

  const { data: universitiesData, isLoading: isLoadingUniversities } = useQuery(
    {
      queryKey: [QUERY_KEYS.UNIVERSITIES, { fetchAll: true }],
      queryFn: () => universityService.getUniversities({ fetchAll: true }),
      select: (data) => data.data || [],
    }
  );

  const { data: organizationsData, isLoading: isLoadingOrgs } = useQuery({
    queryKey: [
      QUERY_KEYS.ORGANIZATIONS,
      selectedUniversityId,
      { fetchAll: true },
    ],
    queryFn: () =>
      organizationService.getOrganizations({
        universityId: selectedUniversityId,
        fetchAll: true,
      }),
    enabled: !!selectedUniversityId,
    select: (data) => data.data || [],
  });

  const { data: levelsData, isLoading: isLoadingLevels } = useQuery({
    queryKey: [
      QUERY_KEYS.EDUCATION_LEVELS,
      selectedOrganizationId,
      { fetchAll: true },
    ],
    queryFn: () =>
      organizationService.getEducationLevels({
        organizationId: selectedOrganizationId,
        fetchAll: true,
      }),
    enabled: !!selectedOrganizationId,
    select: (data) => data.data || [],
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      educationLevelId: "",
    },
  });

  const mutation = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_CLASS,
    mutationFn: (data: CreateClassFormValues) => classService.createClass(data),
    invalidateQueryKey: [QUERY_KEYS.CLASSES],
    successMessage: "Thêm lớp học thành công!",
    errorMessage: "Đã có lỗi xảy ra!",
    onSuccess: () => closeModal(),
  });

  const universityOptions =
    universitiesData?.map((uni) => ({
      value: uni.id,
      label: uni.universityName,
    })) || [];

  const organizationOptions =
    organizationsData?.map((org) => ({
      value: org.id,
      label: org.organizationName,
    })) || [];

  const levelOptions =
    levelsData?.map((level) => ({
      value: level.id,
      label: level.levelName,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-6 py-2"
    >
      {/* Chọn Trường đại học */}
      <div className="relative z-30">
        <Select
          label="Chọn trường đại học"
          required
          placeholder="Chọn trường đại học..."
          prefixIcon={<HiOutlineOfficeBuilding size={16} />}
          options={universityOptions}
          value={selectedUniversityId}
          onChange={(val) => {
            setSelectedUniversityId(String(val));
            setSelectedOrganizationId("");
            setValue("educationLevelId", "");
          }}
          isLoading={isLoadingUniversities}
          filter={{
            enabled: true,
            mode: "client",
            placeholder: "Tìm trường...",
          }}
        />
      </div>

      {/* Chọn Khoa/Ngành */}
      <div className="relative z-20">
        <Select
          label="Chọn khoa/ngành"
          required
          placeholder={"Chọn khoa/ngành..."}
          prefixIcon={<HiOutlineTag size={16} />}
          options={organizationOptions}
          value={selectedOrganizationId}
          onChange={(val) => {
            setSelectedOrganizationId(String(val));
            setValue("educationLevelId", "");
          }}
          disabled={!selectedUniversityId}
          isLoading={isLoadingOrgs}
          filter={{
            enabled: true,
            mode: "client",
            placeholder: "Tìm khoa/ngành...",
          }}
        />
      </div>

      {/* Chọn Bậc đào tạo */}
      <div className="relative z-10">
        <Controller
          control={control}
          name="educationLevelId"
          render={({ field: { value, onChange } }) => (
            <div>
              <Select
                label="Chọn bậc đào tạo"
                required
                placeholder={"Chọn bậc đào tạo..."}
                prefixIcon={<HiOutlineAcademicCap size={16} />}
                options={levelOptions}
                value={value}
                onChange={(val) => onChange(String(val))}
                disabled={!selectedOrganizationId}
                error={errors.educationLevelId?.message}
                isLoading={isLoadingLevels}
                filter={{
                  enabled: true,
                  mode: "client",
                  placeholder: "Tìm bậc đào tạo...",
                }}
              />
            </div>
          )}
        />
      </div>

      {/* Tên lớp học */}
      <Input
        label="Tên lớp học"
        placeholder="VD: CNTT-K60, AT15..."
        prefixIcon={<HiOutlineUserGroup />}
        error={errors.className?.message}
        isLoading={mutation.isPending}
        {...register("className")}
        required
      />

      <div className="flex flex-col gap-4">
        <Divide />
        <div className="flex items-center justify-end gap-3 px-4">
          <Button
            variant="ghost"
            type="button"
            onClick={closeModal}
            isLoading={mutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={mutation.isPending}
            disabled={!isDirty}
          >
            Thêm mới
          </Button>
        </div>
      </div>
    </form>
  );
}
