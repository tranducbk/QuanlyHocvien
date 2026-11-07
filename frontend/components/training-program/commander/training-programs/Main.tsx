"use client";

import {
  AiOutlineArrowRight,
  AiOutlineClose,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineRead,
} from "@/library/icons";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createPortal } from "react-dom";
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
import { useModalStore } from "@/store/useModalStore";
import CreateOrganizationForm from "../universities/[organizations]/CreateOrganizationForm";
import type { Organization } from "@/types/training-program/organizations";

// Keep the selected ID when editing an existing program: old duplicate records
// can have their own education levels and must not be silently reassigned.
function uniqueMajorOptions(records: Organization[], selectedId: string) {
  const grouped = new Map<string, Organization>();
  for (const record of [...records].sort((left, right) => left.id.localeCompare(right.id))) {
    const label = record.organizationName.normalize("NFC").trim().replace(/\s+/gu, " ");
    const key = `${record.universityId}:${label.toLocaleLowerCase("vi")}`;
    if (!grouped.has(key) || record.id === selectedId) {
      grouped.set(key, { ...record, organizationName: label });
    }
  }
  return Array.from(grouped.values());
}

const he5ProgramLabel = (program: TrainingProgram) =>
  [
    program.university?.universityName,
    program.organization?.organizationName,
    program.educationLevel?.levelName,
  ]
    .filter(Boolean)
    .join(" · ") || program.name;

const EMPTY_PROGRAMS: TrainingProgram[] = [];
const MIN_COURSE_YEAR = 1945;
const MAX_COURSE_YEAR = 2100;

function CourseYearSlider({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null;
  min: number;
  max: number;
  onChange: (year: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
        <span className="min-w-12 text-right font-semibold tabular-nums text-primary-700 dark:text-primary-300">
          {value ?? "Chưa chọn"}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={Math.max(min, max)}
        step={1}
        value={value ?? min}
        aria-valuetext={value ? String(value) : "Chưa chọn"}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary-600"
      />
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{min}</span>
        <span>{Math.max(min, max)}</span>
      </div>
    </div>
  );
}

export default function Main({ systemCode }: { systemCode: string }) {
  const isHe5 = systemCode === "HE_5";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [educationLevelId, setEducationLevelId] = useState("");
  const openModal = useModalStore((state) => state.openModal);
  const handleCreateMajor = () => {
    if (!universityId) return;
    openModal({
      title: `Tạo ngành học · ${universities.find((item) => item.id === universityId)?.universityCode ?? ""}`,
      content: <CreateOrganizationForm universityId={universityId} onCreated={(organization) => {
        setOrganizationId(organization.id);
        setEducationLevelId("");
      }} />,
      size: "md",
      config: { mutationKey: MUTATION_KEYS.CREATE_ORGANIZATION },
    });
  };
  const [filterUniversityId, setFilterUniversityId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [editingProgramId, setEditingProgramId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingUniversityId, setEditingUniversityId] = useState("");
  const [editingOrganizationId, setEditingOrganizationId] = useState("");
  const [editingEducationLevelId, setEditingEducationLevelId] = useState("");
  const [programId, setProgramId] = useState("");
  const [versionName, setVersionName] = useState("");
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [editingVersionId, setEditingVersionId] = useState("");
  const [editingVersionName, setEditingVersionName] = useState("");
  const [editingStartYear, setEditingStartYear] = useState<number | null>(null);
  const [editingEndYear, setEditingEndYear] = useState<number | null>(null);
  const [versionPage, setVersionPage] = useState(1);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const closeProgramDetailsButtonRef = useRef<HTMLButtonElement>(null);

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

  const programs = programsQuery.data?.data ?? EMPTY_PROGRAMS;
  const universities = universitiesQuery.data?.data ?? [];
  const organizations = uniqueMajorOptions(organizationsQuery.data?.data ?? [], organizationId);
  const educationLevels = educationLevelsQuery.data?.data ?? [];
  const editingOrganizations = uniqueMajorOptions(editingOrganizationsQuery.data?.data ?? [], editingOrganizationId);
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
  const selectedProgram =
    visiblePrograms.find((program) => program.id === selectedProgramId) ?? null;
  const isCreatingSelectedVersion =
    isCreatingVersion && programId === selectedProgramId;
  const versionsPerPage = 4;
  const versionPageCount = selectedProgram
    ? Math.ceil(selectedProgram.versions.length / versionsPerPage)
    : 0;
  const visibleVersions = selectedProgram
    ? selectedProgram.versions.slice(
        (versionPage - 1) * versionsPerPage,
        versionPage * versionsPerPage
      )
    : [];
  const displayedVersions = editingVersionId
    ? visibleVersions.filter((version) => version.id === editingVersionId)
    : visibleVersions;
  useEffect(() => {
    if (
      !selectedProgramId ||
      !visiblePrograms.some((program) => program.id === selectedProgramId)
    ) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProgramId("");
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeProgramDetailsButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [selectedProgramId, visiblePrograms]);
  const placementInvalid =
    isHe5 && (!universityId || !organizationId || !educationLevelId);
  const editPlacementInvalid =
    isHe5 &&
    (!editingUniversityId ||
      !editingOrganizationId ||
      !editingEducationLevelId);
  const createInvalid = isHe5 ? placementInvalid : !name.trim();
  const editInvalid = isHe5 ? editPlacementInvalid : !editingName.trim();

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
      setStartYear(null);
      setEndYear(null);
      setIsCreatingVersion(false);
      setVersionPage(
        Math.ceil(((selectedProgram?.versions.length ?? 0) + 1) / versionsPerPage)
      );
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
  const updateVersion = useAppMutation({
    mutationKey: [QUERY_KEYS.TRAINING_PROGRAMS, "version-update"],
    mutationFn: ({
      programId,
      versionId,
      name,
      startYear,
      endYear,
    }: {
      programId: string;
      versionId: string;
      name: string;
      startYear: number;
      endYear: number;
    }) =>
      trainingProgramService.updateVersion(programId, versionId, {
        name,
        startYear,
        endYear,
      }),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã cập nhật thông tin khóa",
    onSuccess: () => {
      setEditingVersionId("");
      setEditingVersionName("");
      setEditingStartYear(null);
      setEditingEndYear(null);
    },
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
    if (startYear === null || endYear === null || endYear <= startYear) return;
    createVersion.mutate({
      id: programId,
      data: {
        name: versionName.trim(),
        startYear,
        endYear,
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
  const closeVersionForm = () => {
    setIsCreatingVersion(false);
    setVersionName("");
    setStartYear(null);
    setEndYear(null);
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
          ? undefined
          : `Quản lý chương trình đào tạo thuộc ${systemCode.replace("HE_", "Hệ ")}. Khóa mới được lưu ở trạng thái nháp.`
      }
      actions={
        <Button
          type="button"
          variant={isCreatingProgram ? "secondary" : "primary"}
          icon={isCreatingProgram ? undefined : AiOutlinePlus}
          onClick={() => {
            setIsCreatingProgram((prev) => !prev);
            closeVersionForm();
          }}
        >
          {isCreatingProgram ? "Đóng biểu mẫu" : "Thêm chương trình"}
        </Button>
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
      <div className="space-y-6">
        {/* Khung form tạo chương trình */}
        {isCreatingProgram && (
          <form
            onSubmit={submitProgram}
            className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6"
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
                <div className="space-y-2">
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
                <button type="button" onClick={handleCreateMajor} disabled={!universityId}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline disabled:opacity-40 disabled:no-underline dark:text-primary-300">
                  <AiOutlinePlus aria-hidden="true" /> Tạo ngành học
                </button>
                </div>
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
                  Chưa có trường để gắn chương trình. Hãy tạo trường và ngành
                  tại{" "}
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
                  Trường này chưa có ngành học. Chọn “Tạo ngành học” để bổ sung.
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
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Danh sách chương trình</h2>
              {isHe5 && <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-50 px-2 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">{visiblePrograms.length}</span>}
            </div>
            {!isHe5 && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {visiblePrograms.length} chương trình
              {filterUniversityId ? " phù hợp với bộ lọc" : " đã được lưu"}
            </p>}
            {!isHe5 && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Chọn chương trình để xem và quản lý các khóa đào tạo.
              </p>
            )}
          </div>
          {isHe5 && (
            <div className="w-full sm:max-w-xs">
              <Select
                label="Lọc theo trường"
                value={filterUniversityId}
                onChange={(value) => {
                  setFilterUniversityId(String(value));
                  setSelectedProgramId("");
                }}
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
          <div
            className="rounded-2xl border border-neutral-200 p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
            role="status"
            aria-live="polite"
          >
            Đang tải chương trình đào tạo...
          </div>
        ) : visiblePrograms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-10 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
            <h3 className="font-semibold">
              {filterUniversityId
                ? "Không tìm thấy chương trình phù hợp"
                : "Chưa có chương trình đào tạo"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {filterUniversityId
                ? "Thử chọn trường khác hoặc xem tất cả chương trình."
                : "Tạo chương trình để bắt đầu quản lý các khóa đào tạo."}
            </p>
            {!isCreatingProgram && (
              <Button
                type="button"
                className="mt-5"
                icon={AiOutlinePlus}
                onClick={() => setIsCreatingProgram(true)}
              >
                Thêm chương trình
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {visiblePrograms.map((program) => {
                const isSelected = selectedProgram?.id === program.id;
                return (
                  <button
                    key={program.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedProgramId(program.id);
                      setVersionPage(1);
                      setEditingProgramId("");
                      setEditingVersionId("");
                      closeVersionForm();
                    }}
                    className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-200"
                        : "border-neutral-200 bg-white shadow-sm hover:border-primary-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {isHe5 ? <>
                      <div className="flex items-start gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                          <AiOutlineRead className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-300">{program.university?.universityCode}</span>
                          <span className="mt-1 block break-words text-sm leading-5 text-neutral-600 dark:text-neutral-400">{program.university?.universityName}</span>
                        </div>
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${program.isActive ? "bg-emerald-500" : "bg-neutral-300"}`} aria-label={program.isActive ? "Đang hoạt động" : "Tạm dừng"} />
                      </div>
                      <div className="flex-1 space-y-3 px-5 py-4">
                        <h3 className="break-words text-lg font-semibold leading-7 text-neutral-900 dark:text-neutral-100">{program.organization?.organizationName || program.name}</h3>
                        <span className="inline-flex rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{program.educationLevel?.levelName || "Chưa có trình độ"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-neutral-50/80 px-5 py-3 text-sm dark:bg-neutral-900/60">
                        <span className="text-neutral-500 dark:text-neutral-400">{program.versions.length} khóa đào tạo</span>
                        <span className="inline-flex items-center gap-2 font-semibold text-primary-700 dark:text-primary-300">Xem chi tiết <AiOutlineArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
                      </div>
                    </> : <span className="px-4 py-3 font-semibold">{program.name}</span>}
                  </button>
                );
              })}
            </div>
            {!isHe5 && !selectedProgram && (
              <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                Chọn một chương trình để xem danh sách khóa đào tạo.
              </div>
            )}
            {selectedProgram &&
              typeof document !== "undefined" &&
              createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-3 backdrop-blur-sm sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-label={`Chi tiết chương trình ${selectedProgram.name}`}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedProgramId("");
                  }
                }}
              >
                <div className="flex h-fit max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-neutral-950 dark:ring-white/10">
                  <div className="z-10 flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
                    <p className="truncate pr-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      {selectedProgram.name}
                    </p>
                    <button
                      ref={closeProgramDetailsButtonRef}
                      type="button"
                      aria-label="Đóng chi tiết chương trình"
                      onClick={() => setSelectedProgramId("")}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-neutral-800 dark:hover:text-white"
                    >
                      <AiOutlineClose size={20} aria-hidden="true" />
                    </button>
                  </div>
                  <article
                    className="min-h-0 overflow-hidden p-3 sm:p-5"
                  >
              {editingProgramId === selectedProgram.id ? (
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editInvalid) return;
                    updateProgram.mutate({
                      id: selectedProgram.id,
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {isHe5
                          ? he5ProgramLabel(selectedProgram)
                          : `${selectedProgram.trainingSystem?.name} · ${selectedProgram.name}`}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selectedProgram.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {selectedProgram.isActive
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </div>
                    {!isHe5 && selectedProgram.description && (
                      <p className="mt-1 line-clamp-1 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedProgram.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(selectedProgram)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={updateProgramStatus.isPending}
                      onClick={() =>
                        updateProgramStatus.mutate({
                          id: selectedProgram.id,
                          isActive: !selectedProgram.isActive,
                        })
                      }
                    >
                      {selectedProgram.isActive
                        ? "Ngừng hoạt động"
                        : "Kích hoạt"}
                    </Button>
                  </div>
                </div>
              )}
              {!isHe5 && (
                <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold">Các khóa đào tạo</h4>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {selectedProgram.versions.length} khóa
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          isCreatingSelectedVersion
                            ? "secondary"
                            : "outline"
                        }
                        icon={
                          isCreatingSelectedVersion
                            ? undefined
                            : AiOutlinePlus
                        }
                        onClick={() => {
                          if (isCreatingSelectedVersion) {
                            closeVersionForm();
                            return;
                          }
                          setEditingVersionId("");
                          closeVersionForm();
                          setProgramId(selectedProgram.id);
                          setIsCreatingVersion(true);
                          setIsCreatingProgram(false);
                        }}
                      >
                        {isCreatingSelectedVersion ? "Đóng" : "Thêm khóa"}
                      </Button>
                    </div>
                  </div>
                  {!isCreatingVersion &&
                    (selectedProgram.versions.length === 0 ? (
                      <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                        Chưa có khóa đào tạo trong chương trình này.
                      </p>
                    ) : (
                      <ul
                        className={`grid gap-2 ${
                          editingVersionId
                            ? "grid-cols-1"
                            : "grid-cols-1 sm:grid-cols-2"
                        }`}
                      >
                        {displayedVersions.map((version) => (
                        <li
                          key={version.id}
                          className="flex min-h-[76px] items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 dark:border-neutral-800"
                        >
                          {editingVersionId === version.id ? (
                            <form
                              className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-end"
                              onSubmit={(event) => {
                                event.preventDefault();
                                if (
                                  !editingVersionName.trim() ||
                                  editingStartYear === null ||
                                  editingEndYear === null ||
                                  editingEndYear <= editingStartYear
                                ) {
                                  return;
                                }
                                updateVersion.mutate({
                                  programId: selectedProgram.id,
                                  versionId: version.id,
                                  name: editingVersionName.trim(),
                                  startYear: editingStartYear,
                                  endYear: editingEndYear,
                                });
                              }}
                            >
                              <div className="grid min-w-0 flex-1 gap-4">
                                <Input
                                  label="Tên khóa"
                                  required
                                  maxLength={255}
                                  value={editingVersionName}
                                  onChange={(event) =>
                                    setEditingVersionName(event.target.value)
                                  }
                                  autoFocus
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <CourseYearSlider
                                    id={`edit-start-year-${version.id}`}
                                    label="Năm bắt đầu"
                                    value={editingStartYear}
                                    min={MIN_COURSE_YEAR}
                                    max={
                                      editingEndYear !== null
                                        ? editingEndYear - 1
                                        : MAX_COURSE_YEAR - 1
                                    }
                                    onChange={setEditingStartYear}
                                  />
                                  <CourseYearSlider
                                    id={`edit-end-year-${version.id}`}
                                    label="Năm kết thúc"
                                    value={editingEndYear}
                                    min={
                                      editingStartYear !== null
                                        ? editingStartYear + 1
                                        : MIN_COURSE_YEAR + 1
                                    }
                                    max={MAX_COURSE_YEAR}
                                    onChange={setEditingEndYear}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Hiển thị: {selectedProgram.name} ·{" "}
                                    {editingVersionName.trim() || "Tên khóa"}
                                  </p>
                                  {(editingStartYear === null ||
                                    editingEndYear === null) && (
                                    <p className="mt-1 text-sm text-red-600">
                                      Chọn năm bắt đầu và năm kết thúc bằng
                                      thanh trượt.
                                    </p>
                                  )}
                                  {editingStartYear !== null &&
                                    editingEndYear !== null &&
                                    editingEndYear <= editingStartYear && (
                                      <p className="mt-1 text-sm text-red-600">
                                        Năm kết thúc phải sau năm bắt đầu.
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  size="sm"
                                  isLoading={updateVersion.isPending}
                                  disabled={
                                    !editingVersionName.trim() ||
                                    editingStartYear === null ||
                                    editingEndYear === null ||
                                    editingEndYear <= editingStartYear
                                  }
                                >
                                  Lưu
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setEditingVersionId("");
                                    setEditingVersionName("");
                                    setEditingStartYear(null);
                                    setEditingEndYear(null);
                                  }}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">
                                {selectedProgram.name} ·{" "}
                                {version.name.trim().toLocaleLowerCase() ===
                                selectedProgram.name.trim().toLocaleLowerCase()
                                  ? `${version.startYear ?? "?"}–${version.endYear ?? "?"}`
                                  : version.name}
                              </p>
                              {(version.startYear !== null || version.endYear !== null) &&
                                version.name.trim().toLocaleLowerCase() !==
                                  selectedProgram.name.trim().toLocaleLowerCase() && (
                                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                                    Niên khóa: {version.startYear ?? "?"}–
                                    {version.endYear ?? "?"}
                                  </p>
                                )}
                            </div>
                          )}
                          {editingVersionId !== version.id && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              icon={AiOutlineEdit}
                              onClick={() => {
                                setEditingVersionId(version.id);
                                setEditingVersionName(version.name);
                                setEditingStartYear(version.startYear);
                                setEditingEndYear(version.endYear);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          )}
                        </li>
                        ))}
                      </ul>
                    ))}
                  {!isCreatingVersion && !editingVersionId && versionPageCount > 1 && (
                    <nav
                      className="mt-2 flex items-center justify-center gap-2"
                      aria-label="Phân trang khóa đào tạo"
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={versionPage === 1}
                        onClick={() =>
                          setVersionPage((page) => Math.max(1, page - 1))
                        }
                      >
                        Trang trước
                      </Button>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Trang {versionPage} / {versionPageCount}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={versionPage === versionPageCount}
                        onClick={() =>
                          setVersionPage((page) =>
                            Math.min(versionPageCount, page + 1)
                          )
                        }
                      >
                        Trang sau
                      </Button>
                    </nav>
                  )}
                  {isCreatingSelectedVersion && (
                    <form
                      onSubmit={submitVersion}
                      className="mt-2 grid gap-3 rounded-xl border border-primary-200 bg-primary-50/40 p-3 sm:grid-cols-2 dark:border-primary-900 dark:bg-primary-950/20"
                    >
                      <div className="sm:col-span-2">
                        <h5 className="font-semibold">
                          Thêm khóa · {selectedProgram.name}
                        </h5>
                      </div>
                      <Input
                        label="Tên hoặc mã khóa"
                        required
                        maxLength={255}
                        placeholder="Ví dụ: TS-41"
                        value={versionName}
                        onChange={(event) => setVersionName(event.target.value)}
                      />
                      <p className="self-center text-sm text-neutral-600 dark:text-neutral-400">
                      Hiển thị: {selectedProgram.name} ·{" "}
                        {versionName.trim() || "Tên khóa"}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 sm:col-span-2">
                        <CourseYearSlider
                          id={`create-start-year-${selectedProgram.id}`}
                          label="Năm bắt đầu"
                          value={startYear}
                          min={MIN_COURSE_YEAR}
                          max={
                            endYear !== null
                              ? endYear - 1
                              : MAX_COURSE_YEAR - 1
                          }
                          onChange={setStartYear}
                        />
                        <CourseYearSlider
                          id={`create-end-year-${selectedProgram.id}`}
                          label="Năm kết thúc"
                          value={endYear}
                          min={
                            startYear !== null
                              ? startYear + 1
                              : MIN_COURSE_YEAR + 1
                          }
                          max={MAX_COURSE_YEAR}
                          onChange={setEndYear}
                        />
                      </div>
                      {(startYear === null || endYear === null) && (
                        <p className="text-sm text-red-600 sm:col-span-2">
                          Kéo thanh trượt để chọn năm bắt đầu và năm kết thúc.
                        </p>
                      )}
                      {startYear !== null &&
                        endYear !== null &&
                        endYear <= startYear && (
                          <p className="text-sm text-red-600 sm:col-span-2">
                            Năm kết thúc phải sau năm bắt đầu.
                          </p>
                        )}
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <Button
                          type="submit"
                          isLoading={createVersion.isPending}
                          disabled={
                            !versionName.trim() ||
                            startYear === null ||
                            endYear === null ||
                            endYear <= startYear
                          }
                        >
                          Lưu khóa nháp
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={closeVersionForm}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              </article>
                </div>
              </div>,
              document.body
              )}
          </>
        )}
      </section>
    </PageContainer>
  );
}
