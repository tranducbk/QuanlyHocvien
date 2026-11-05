"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import PageContainer from "@/library/PageContainer";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { trainingProgramService } from "@/services/training-program/training-programs";
import { universityService } from "@/services/training-program/universities";
import { organizationService } from "@/services/training-program/organizations";
import type { TrainingProgram } from "@/types/training-program/training-programs";

const programLabel = (program: TrainingProgram) =>
  [
    program.university?.universityName,
    program.organization?.organizationName,
    program.name,
  ]
    .filter(Boolean)
    .join(" · ");

const he5ProgramLabel = (program: TrainingProgram) =>
  [
    program.university?.universityName,
    program.organization?.organizationName,
    program.educationLevel?.levelName,
  ]
    .filter(Boolean)
    .join(" · ") || program.name;

export default function Main({ systemCode }: { systemCode: string }) {
  const isHe5 = systemCode === "HE_5";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [educationLevelId, setEducationLevelId] = useState("");
  const [filterUniversityId, setFilterUniversityId] = useState("");
  const [editingProgramId, setEditingProgramId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingUniversityId, setEditingUniversityId] = useState("");
  const [editingOrganizationId, setEditingOrganizationId] = useState("");
  const [editingEducationLevelId, setEditingEducationLevelId] = useState("");
  const [programId, setProgramId] = useState("");
  const [versionName, setVersionName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  const programsQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    queryFn: () => trainingProgramService.getPrograms(),
  });
  const universitiesQuery = useQuery({
    queryKey: [QUERY_KEYS.UNIVERSITIES, "program-options"],
    queryFn: () => universityService.getUniversities({ fetchAll: true }),
    enabled: isHe5,
  });
  const organizationsQuery = useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, universityId, "program-options"],
    queryFn: () =>
      organizationService.getOrganizations({ universityId, fetchAll: true }),
    enabled: isHe5 && Boolean(universityId),
  });
  const educationLevelsQuery = useQuery({
    queryKey: [QUERY_KEYS.EDUCATION_LEVELS, organizationId, "program-options"],
    queryFn: () =>
      organizationService.getEducationLevels({
        organizationId,
        fetchAll: true,
        sortBy: "levelName",
        sortOrder: "asc",
      }),
    enabled: isHe5 && Boolean(organizationId),
  });
  const editingOrganizationsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ORGANIZATIONS,
      editingUniversityId,
      "program-options",
    ],
    queryFn: () =>
      organizationService.getOrganizations({
        universityId: editingUniversityId,
        fetchAll: true,
      }),
    enabled: isHe5 && Boolean(editingUniversityId),
  });
  const editingEducationLevelsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.EDUCATION_LEVELS,
      editingOrganizationId,
      "program-options",
    ],
    queryFn: () =>
      organizationService.getEducationLevels({
        organizationId: editingOrganizationId,
        fetchAll: true,
        sortBy: "levelName",
        sortOrder: "asc",
      }),
    enabled: isHe5 && Boolean(editingOrganizationId),
  });

  const programs = programsQuery.data?.data ?? [];
  const universities = universitiesQuery.data?.data ?? [];
  const organizations = organizationsQuery.data?.data ?? [];
  const educationLevels = educationLevelsQuery.data?.data ?? [];
  const editingOrganizations = editingOrganizationsQuery.data?.data ?? [];
  const editingEducationLevels = editingEducationLevelsQuery.data?.data ?? [];
  const visiblePrograms = useMemo(
    () =>
      isHe5 && filterUniversityId
        ? programs.filter(
            (program) => program.universityId === filterUniversityId
          )
        : programs,
    [filterUniversityId, isHe5, programs]
  );
  const placementInvalid =
    isHe5 && (!universityId || !organizationId || !educationLevelId);
  const editPlacementInvalid =
    isHe5 &&
    (!editingUniversityId ||
      !editingOrganizationId ||
      !editingEducationLevelId);
  const createInvalid = isHe5 ? placementInvalid : !name.trim();
  const editInvalid = isHe5
    ? editPlacementInvalid
    : !editingName.trim();

  const createProgram = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_TRAINING_PROGRAM,
    mutationFn: trainingProgramService.createProgram,
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã lưu chương trình đào tạo",
    onSuccess: () => {
      setName("");
      setDescription("");
      setUniversityId("");
      setOrganizationId("");
      setEducationLevelId("");
      setIsCreatingProgram(false);
    },
  });
  const createVersion = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_CURRICULUM_VERSION,
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof trainingProgramService.createVersion>[1];
    }) => trainingProgramService.createVersion(id, data),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã lưu khóa chương trình",
    onSuccess: () => {
      setVersionName("");
      setEffectiveFrom("");
      setEffectiveTo("");
      setIsCreatingVersion(false);
    },
  });
  const updateProgram = useAppMutation({
    mutationKey: [QUERY_KEYS.TRAINING_PROGRAMS, "update"],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof trainingProgramService.updateProgram>[1];
    }) => trainingProgramService.updateProgram(id, data),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã cập nhật chương trình đào tạo",
    onSuccess: () => setEditingProgramId(""),
  });
  const updateProgramStatus = useAppMutation({
    mutationKey: [QUERY_KEYS.TRAINING_PROGRAMS, "status"],
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      trainingProgramService.updateProgramStatus(id, isActive),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã cập nhật trạng thái chương trình",
  });

  const submitProgram = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createInvalid) return;
    createProgram.mutate(
      isHe5
        ? { universityId, organizationId, educationLevelId }
        : {
            name: name.trim(),
            description: description.trim(),
          }
    );
  };
  const submitVersion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) return;
    createVersion.mutate({
      id: programId,
      data: {
        name: versionName.trim(),
        effectiveFrom: effectiveFrom || null,
        effectiveTo: effectiveTo || null,
      },
    });
  };
  const startEditing = (program: TrainingProgram) => {
    setEditingProgramId(program.id);
    setEditingName(program.name);
    setEditingDescription(program.description ?? "");
    setEditingUniversityId(program.universityId ?? "");
    setEditingOrganizationId(program.organizationId ?? "");
    setEditingEducationLevelId(program.educationLevelId ?? "");
  };

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Chương trình đào tạo" },
      ]}
      title="Chương trình đào tạo"
      subtitle={
        isHe5
          ? "Chương trình đào tạo Hệ 5 được xác định theo trường, ngành và trình độ."
          : `Quản lý chương trình đào tạo thuộc ${systemCode.replace("HE_", "Hệ ")}. Khóa mới được lưu ở trạng thái nháp.`
      }
      isError={
        programsQuery.isError ||
        (isHe5 &&
          (universitiesQuery.isError ||
            organizationsQuery.isError ||
            educationLevelsQuery.isError))
      }
      onRetry={() => {
        void programsQuery.refetch();
        if (!isHe5) return;
        void universitiesQuery.refetch();
        if (universityId) void organizationsQuery.refetch();
        if (organizationId) void educationLevelsQuery.refetch();
      }}
    >
      <div className="space-y-4">
        {/* Thanh nút bấm tạo mới */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={isCreatingProgram ? "secondary" : "primary"}
            onClick={() => {
              setIsCreatingProgram((prev) => !prev);
              setIsCreatingVersion(false);
            }}
          >
            {isCreatingProgram ? "✕ Đóng tạo chương trình" : "+ Thêm chương trình"}
          </Button>
          {!isHe5 && (
            <Button
              type="button"
              variant={isCreatingVersion ? "secondary" : "primary"}
              onClick={() => {
                setIsCreatingVersion((prev) => !prev);
                setIsCreatingProgram(false);
              }}
            >
              {isCreatingVersion ? "✕ Đóng tạo khóa" : "+ Thêm khóa"}
            </Button>
          )}
        </div>

        {/* Khung form tạo chương trình */}
        {isCreatingProgram && (
          <form
            onSubmit={submitProgram}
            className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h2 className="text-lg font-bold">Thêm chương trình đào tạo</h2>
              <button
                type="button"
                className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                onClick={() => setIsCreatingProgram(false)}
              >
                ✕ Đóng
              </button>
            </div>
            {isHe5 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Select
                  label="Trường"
                  required
                  value={universityId}
                  onChange={(value) => {
                    setUniversityId(String(value));
                    setOrganizationId("");
                    setEducationLevelId("");
                  }}
                  options={universities.map((university) => ({
                    value: university.id,
                    label: `${university.universityName} (${university.universityCode})`,
                  }))}
                />
                <Select
                  label="Ngành học"
                  required
                  value={organizationId}
                  onChange={(value) => {
                    setOrganizationId(String(value));
                    setEducationLevelId("");
                  }}
                  disabled={!universityId}
                  options={organizations.map((organization) => ({
                    value: organization.id,
                    label: organization.organizationName,
                  }))}
                />
                <Select
                  label="Trình độ"
                  required
                  value={educationLevelId}
                  onChange={(value) => setEducationLevelId(String(value))}
                  disabled={!organizationId}
                  options={educationLevels.map((level) => ({
                    value: level.id,
                    label: level.levelName,
                  }))}
                />
              </div>
            ) : (
              <>
                <Input
                  label="Tên chương trình"
                  required
                  maxLength={255}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Input
                  label="Mô tả"
                  maxLength={2000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </>
            )}
            {isHe5 &&
              !universitiesQuery.isLoading &&
              universities.length === 0 && (
                <p className="text-sm text-amber-600">
                  Chưa có trường để gắn chương trình. Hãy tạo trường và ngành tại{" "}
                  <Link
                    href="/commander/universities"
                    className="font-semibold underline"
                  >
                    Cơ sở đào tạo
                  </Link>
                  .
                </p>
              )}
            {isHe5 &&
              universityId &&
              !organizationsQuery.isLoading &&
              organizations.length === 0 && (
                <p className="text-sm text-amber-600">
                  Trường này chưa có ngành. Hãy thêm ngành tại{" "}
                  <Link
                    href={`/commander/universities/${universityId}`}
                    className="font-semibold underline"
                  >
                    Cơ sở đào tạo
                  </Link>
                  .
                </p>
              )}
            {isHe5 &&
              organizationId &&
              !educationLevelsQuery.isLoading &&
              educationLevels.length === 0 && (
                <p className="text-sm text-amber-600">
                  Ngành này chưa có trình độ. Hãy thêm trình độ tại{" "}
                  <Link
                    href={`/commander/universities/${universityId}`}
                    className="font-semibold underline"
                  >
                    Cơ sở đào tạo
                  </Link>
                  .
                </p>
              )}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                isLoading={createProgram.isPending}
                disabled={createInvalid}
              >
                Lưu chương trình
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreatingProgram(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        )}

        {/* Khung form tạo khóa */}
        {!isHe5 && isCreatingVersion && (
          <form
            onSubmit={submitVersion}
            className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h2 className="text-lg font-bold">Thêm khóa đào tạo</h2>
              <button
                type="button"
                className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                onClick={() => setIsCreatingVersion(false)}
              >
                ✕ Đóng
              </button>
            </div>
            <Select
              label="Chương trình"
              required
              value={programId}
              onChange={(value) => setProgramId(String(value))}
              options={visiblePrograms.map((program) => ({
                value: program.id,
                label: programLabel(program),
              }))}
            />
            <Input
              label="Tên khóa"
              required
              maxLength={255}
              value={versionName}
              onChange={(event) => setVersionName(event.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label="Hiệu lực từ"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
              />
              <Input
                type="date"
                label="Hiệu lực đến"
                min={effectiveFrom || undefined}
                value={effectiveTo}
                onChange={(event) => setEffectiveTo(event.target.value)}
              />
            </div>
            {effectiveFrom && effectiveTo && effectiveTo < effectiveFrom && (
              <p className="text-sm text-red-600">
                Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                isLoading={createVersion.isPending}
                disabled={
                  !programId ||
                  !versionName.trim() ||
                  Boolean(
                    effectiveFrom && effectiveTo && effectiveTo < effectiveFrom
                  )
                }
              >
                Lưu khóa nháp
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreatingVersion(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-bold">
            Dữ liệu đã lưu ({visiblePrograms.length})
          </h2>
          {isHe5 && (
            <div className="w-full sm:max-w-xs">
              <Select
                label="Lọc theo trường"
                value={filterUniversityId}
                onChange={(value) => setFilterUniversityId(String(value))}
                options={[
                  { value: "", label: "Tất cả trường" },
                  ...universities.map((university) => ({
                    value: university.id,
                    label: university.universityName,
                  })),
                ]}
              />
            </div>
          )}
        </div>
        {programsQuery.isLoading ? (
          <p>Đang tải...</p>
        ) : visiblePrograms.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
            Chưa có chương trình đào tạo.
          </p>
        ) : (
          visiblePrograms.map((program) => (
            <article
              key={program.id}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              {editingProgramId === program.id ? (
                <form
                  className="grid gap-3 sm:grid-cols-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editInvalid) return;
                    updateProgram.mutate({
                      id: program.id,
                      data: isHe5
                        ? {
                            universityId: editingUniversityId,
                            organizationId: editingOrganizationId,
                            educationLevelId: editingEducationLevelId,
                          }
                        : {
                            name: editingName.trim(),
                            description: editingDescription.trim(),
                          },
                    });
                  }}
                >
                  {isHe5 ? (
                    <>
                      <Select
                        label="Trường"
                        required
                        value={editingUniversityId}
                        onChange={(value) => {
                          setEditingUniversityId(String(value));
                          setEditingOrganizationId("");
                          setEditingEducationLevelId("");
                        }}
                        options={universities.map((university) => ({
                          value: university.id,
                          label: `${university.universityName} (${university.universityCode})`,
                        }))}
                      />
                      <Select
                        label="Ngành học"
                        required
                        value={editingOrganizationId}
                        onChange={(value) => {
                          setEditingOrganizationId(String(value));
                          setEditingEducationLevelId("");
                        }}
                        disabled={!editingUniversityId}
                        options={editingOrganizations.map((organization) => ({
                          value: organization.id,
                          label: organization.organizationName,
                        }))}
                      />
                      <Select
                        label="Trình độ"
                        required
                        value={editingEducationLevelId}
                        onChange={(value) =>
                          setEditingEducationLevelId(String(value))
                        }
                        disabled={!editingOrganizationId}
                        options={editingEducationLevels.map((level) => ({
                          value: level.id,
                          label: level.levelName,
                        }))}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Tên chương trình"
                        required
                        maxLength={255}
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                      <Input
                        label="Mô tả"
                        maxLength={2000}
                        value={editingDescription}
                        onChange={(event) =>
                          setEditingDescription(event.target.value)
                        }
                      />
                    </>
                  )}
                  <div className="flex items-end gap-2">
                    <Button
                      type="submit"
                      isLoading={updateProgram.isPending}
                      disabled={editInvalid}
                    >
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingProgramId("")}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-semibold">
                    {isHe5 ? (
                      he5ProgramLabel(program)
                    ) : (
                      <>
                        {program.trainingSystem?.name} · {program.name}
                      </>
                    )}
                  </div>
                  {!isHe5 && program.description && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {program.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-neutral-500">
                      {program.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary-600"
                      onClick={() => startEditing(program)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary-600"
                      disabled={updateProgramStatus.isPending}
                      onClick={() =>
                        updateProgramStatus.mutate({
                          id: program.id,
                          isActive: !program.isActive,
                        })
                      }
                    >
                      {program.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
                    </button>
                  </div>
                </>
              )}
              {!isHe5 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {program.versions.length === 0 ? (
                    <span className="text-sm text-neutral-500">
                      Chưa có khóa
                    </span>
                  ) : (
                    program.versions.map((version) => (
                      <span
                        key={version.id}
                        className="rounded-lg bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-900"
                      >
                        {version.name}
                        {version.effectiveFrom || version.effectiveTo ? (
                          <span className="text-neutral-500">
                            {" "}
                            (
                            {[
                              version.effectiveFrom?.slice(0, 4),
                              version.effectiveTo?.slice(0, 4),
                            ]
                              .filter(Boolean)
                              .join("–")}
                            )
                          </span>
                        ) : null}{" "}
                        · {version.status}
                      </span>
                    ))
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </PageContainer>
  );
}
