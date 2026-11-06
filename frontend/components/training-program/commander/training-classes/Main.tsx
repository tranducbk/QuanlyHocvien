"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineLockClosed, HiOutlineLockOpen, HiOutlinePencil, HiOutlineUserGroup, HiOutlineViewGrid } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import Input from "@/library/Input";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import type { FilterField } from "@/library/table/TableFilter";
import { QUERY_KEYS } from "@/constants/query-keys";
import useAppMutation from "@/hooks/useAppMutation";
import useClientTableData from "@/hooks/useClientTableData";
import { trainingClassService } from "@/services/training-program/training-classes";
import { trainingProgramService } from "@/services/training-program/training-programs";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalStore } from "@/store/useModalStore";
import TrainingClassStudentsModal from "./TrainingClassStudentsModal";
import type { CreateTrainingClass, TrainingClass } from "@/types/training-program/training-classes";
import type { TrainingProgram } from "@/types/training-program/training-programs";
import { StatCard, type DashboardTone } from "../../../reports/commander/DashboardParts";

const systemNames: Record<string, string> = {
  HE_1: "Hệ 1",
  HE_3: "Hệ 3",
  HE_4: "Hệ 4",
  HE_5: "Hệ 5",
  HE_7: "Hệ 7",
};

const he5ProgramLabel = (program: TrainingProgram) => [
  program.university?.universityName,
  program.organization?.organizationName,
  program.educationLevel?.levelName,
].filter(Boolean).join(" · ") || program.name;

export default function Main({ systemCode, view }: { systemCode: string; view: "overview" | "classes" }) {
  const [editingClassId, setEditingClassId] = useState("");
  const [className, setClassName] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [curriculumVersionId, setCurriculumVersionId] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const commanderId = useAuthStore((state) => state.user?.id);
  const { openModal } = useModalStore();

  const handleOpenStudentsModal = (cls: TrainingClass) => {
    openModal({
      title: `Học viên lớp ${cls.name}`,
      content: <TrainingClassStudentsModal trainingClass={cls} />,
      size: "xl",
    });
  };
  const classesQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    queryFn: trainingClassService.getMine,
    enabled: Boolean(commanderId),
  });
  const programsQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_PROGRAMS, commanderId],
    queryFn: () => trainingProgramService.getPrograms(),
    enabled: Boolean(commanderId),
  });
  const classes = classesQuery.data?.data ?? [];
  const programs = programsQuery.data?.data ?? [];
  const programsForClass = programs.filter((program) => program.isActive);
  const selectedProgram = programsForClass.find((program) => program.id === trainingProgramId);
  const yearOrderInvalid = Boolean(startYear && endYear && Number(endYear) <= Number(startYear));
  const programPairInvalid = systemCode === "HE_5"
    ? Boolean(curriculumVersionId) && !trainingProgramId
    : !trainingProgramId || !curriculumVersionId;
  const systemName = systemNames[systemCode] ?? "Hệ đào tạo";
  const isOverview = view === "overview";
  const saveClass = useAppMutation({
    mutationKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, "save"],
    mutationFn: ({ id, data }: { id: string | null; data: CreateTrainingClass }) =>
      id ? trainingClassService.updateClass(id, data) : trainingClassService.createClass(data),
    invalidateQueryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    successMessage: editingClassId ? "Đã cập nhật lớp đào tạo" : "Đã tạo lớp đào tạo",
    onSuccess: () => resetClassForm(),
  });
  const updateClassStatus = useAppMutation({
    mutationKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, "status"],
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      trainingClassService.updateClassStatus(id, status),
    invalidateQueryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    successMessage: "Đã cập nhật trạng thái lớp",
  });

  const resetClassForm = () => {
    setEditingClassId("");
    setClassName("");
    setTrainingProgramId("");
    setCurriculumVersionId("");
    setStartYear("");
    setEndYear("");
    setIsCreatingClass(false);
  };

  const submitClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (yearOrderInvalid) return;
    saveClass.mutate({
      id: editingClassId || null,
      data: {
        name: className.trim(),
        trainingProgramId: trainingProgramId || null,
        curriculumVersionId: curriculumVersionId || null,
        startYear: startYear ? Number(startYear) : null,
        endYear: endYear ? Number(endYear) : null,
      },
    });
  };

  return (
    <PageContainer
      breadcrumb={isOverview ? [{ label: "Tổng quan" }] : [{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý lớp học" }]}
      title={isOverview ? `Tổng quan ${systemName}` : `Quản lý lớp học · ${systemName}`}
      subtitle={isOverview ? "Lớp đào tạo thuộc phạm vi Chỉ huy của bạn." : "Tạo và quản lý lớp đào tạo trong Hệ được phân công."}
      isError={classesQuery.isError || programsQuery.isError}
      onRetry={() => { void classesQuery.refetch(); void programsQuery.refetch(); }}
      className="space-y-8"
    >
      {isOverview ? (
        <TrainingClassOverview classes={classes} isLoading={!commanderId || classesQuery.isLoading} />
      ) : <section className="space-y-6">
        {/* Thanh tiêu đề và nút tạo lớp */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography variant="h3" weight="bold">
              Danh sách lớp đào tạo ({classes.length})
            </Typography>
            <p className="text-sm text-neutral-500">
              Quản lý danh sách lớp học và phân công học viên trong Hệ được phân công.
            </p>
          </div>
          {!isCreatingClass && !editingClassId && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                resetClassForm();
                setIsCreatingClass(true);
              }}
            >
              + Tạo lớp đào tạo
            </Button>
          )}
        </div>

        {/* Khung form tạo / sửa lớp */}
        {(isCreatingClass || Boolean(editingClassId)) && (
          <form onSubmit={submitClass} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h2 className="text-lg font-bold">{editingClassId ? "Chỉnh sửa lớp đào tạo" : "Tạo lớp đào tạo mới"}</h2>
              <button
                type="button"
                className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                onClick={resetClassForm}
              >
                ✕ Đóng
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Tên lớp" required maxLength={255} value={className} onChange={(event) => setClassName(event.target.value)} />
              <Select label="Chương trình đào tạo" required={systemCode !== "HE_5"} value={trainingProgramId} onChange={(value) => {
                setTrainingProgramId(String(value));
                setCurriculumVersionId("");
                if (systemCode !== "HE_5") {
                  setStartYear("");
                  setEndYear("");
                }
              }} options={[
                ...(systemCode === "HE_5" ? [{ value: "", label: "Chưa gắn chương trình" }] : []),
                ...programsForClass.map((program) => ({
                  value: program.id,
                  label: systemCode === "HE_5"
                    ? he5ProgramLabel(program)
                    : `${program.university?.universityName ? `${program.university.universityName} · ` : ""}${program.name}`,
                })),
              ]} />
              {systemCode !== "HE_5" && (
                <Select label="Khóa" required value={curriculumVersionId}
                  onChange={(value) => {
                    const val = String(value);
                    setCurriculumVersionId(val);
                    const ver = (selectedProgram?.versions ?? []).find((v) => v.id === val);
                    setStartYear(ver?.startYear == null ? "" : String(ver.startYear));
                    setEndYear(ver?.endYear == null ? "" : String(ver.endYear));
                  }}
                  disabled={!trainingProgramId}
                  options={(selectedProgram?.versions ?? []).map((version) => {
                    const from = version.startYear;
                    const to = version.endYear;
                    const range = from != null && to != null ? `${from}–${to}` : from ?? to ?? "";
                    return {
                      value: version.id,
                      label: range ? `${version.name} (${range})` : version.name,
                    };
                  })} />
              )}
              {systemCode === "HE_5" && (
                <>
                  <Input
                    type="number"
                    label="Năm bắt đầu"
                    min={1900}
                    max={2200}
                    value={startYear}
                    onChange={(event) => setStartYear(event.target.value)}
                  />
                  <Input
                    type="number"
                    label="Năm kết thúc"
                    min={1900}
                    max={2200}
                    value={endYear}
                    onChange={(event) => setEndYear(event.target.value)}
                  />
                </>
              )}
            </div>
            {yearOrderInvalid && <p className="text-sm text-red-600">Năm kết thúc phải sau năm bắt đầu.</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" isLoading={saveClass.isPending}
                disabled={!className.trim() || yearOrderInvalid || programPairInvalid}>
                {editingClassId ? "Lưu thay đổi" : "Tạo lớp"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetClassForm}>Hủy</Button>
            </div>
          </form>
        )}
        {!commanderId || classesQuery.isLoading || programsQuery.isLoading ? <p>Đang tải lớp...</p> : (
          <TrainingClassesTable classes={classes} showVersion={systemCode !== "HE_5"} onSelectClass={handleOpenStudentsModal} onEditClass={(trainingClass) => {
            setEditingClassId(trainingClass.id);
            setClassName(trainingClass.name);
            setTrainingProgramId(trainingClass.trainingProgramId ?? "");
            setCurriculumVersionId(trainingClass.curriculumVersionId ?? "");
            setStartYear(trainingClass.startYear?.toString() ?? "");
            setEndYear(trainingClass.endYear?.toString() ?? "");
            setIsCreatingClass(true);
          }} onToggleStatus={(trainingClass) => {
            updateClassStatus.mutate({
              id: trainingClass.id,
              status: trainingClass.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            });
          }} />
        )}
      </section>}
    </PageContainer>
  );
}

const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matchesClass = (row: TrainingClass, filters: Record<string, unknown>) =>
  (!filters.name || normalize(`${row.name} ${row.code}`).includes(normalize(String(filters.name))))
  && (!filters.trainingProgramName || row.trainingProgramName === filters.trainingProgramName)
  && (!filters.status || row.status === filters.status);
const classSortValue = (row: TrainingClass, field: string) => {
  if (field === "years") return row.startYear;
  return row[field as keyof TrainingClass] as string | number | null;
};

function TrainingClassesTable({
  classes,
  showVersion,
  onSelectClass,
  onEditClass,
  onToggleStatus,
}: {
  classes: TrainingClass[];
  showVersion: boolean;
  onSelectClass: (cls: TrainingClass) => void;
  onEditClass: (trainingClass: TrainingClass) => void;
  onToggleStatus: (trainingClass: TrainingClass) => void;
}) {
  const table = useClientTableData(classes, matchesClass, classSortValue);
  const columns = useMemo<ColumnDef<TrainingClass>[]>(() => [
    { id: "name", header: "Tên lớp", accessorKey: "name", cell: ({ row }) => <Typography variant="body" weight="semibold" color="neutral">{row.original.name}</Typography> },
    { id: "code", header: "Mã lớp", accessorKey: "code", cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.code}</Typography> },
    { id: "trainingProgramName", header: "Chương trình đào tạo", accessorKey: "trainingProgramName", cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.trainingProgramName || "—"}</Typography> },
    ...(showVersion ? [{
      id: "curriculumVersionName",
      header: "Khóa",
      accessorKey: "curriculumVersionName",
      cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.curriculumVersionName || "—"}</Typography>,
    } satisfies ColumnDef<TrainingClass>] : []),
    { id: "years", header: "Niên khóa", accessorFn: (row) => row.startYear, cell: ({ row }) => <Typography variant="body" color="neutral">{row.original.startYear != null ? `${row.original.startYear}${row.original.endYear != null ? `–${row.original.endYear}` : ""}` : "—"}</Typography> },
    { id: "status", header: "Trạng thái", accessorKey: "status", cell: ({ row }) => <Badge variant={row.original.status === "ACTIVE" ? "success" : "neutral"}>{row.original.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge> },
    { id: "actions", header: "Hành động", enableSorting: false, cell: ({ row }) => <div className="flex items-center gap-1">
      <ActionButton tooltipText="Chỉnh sửa lớp" icon={HiOutlinePencil} onClick={() => onEditClass(row.original)} color="secondary" />
      <ActionButton tooltipText={row.original.status === "ACTIVE" ? "Ngừng hoạt động" : "Kích hoạt"} icon={row.original.status === "ACTIVE" ? HiOutlineLockOpen : HiOutlineLockClosed} onClick={() => onToggleStatus(row.original)} color={row.original.status === "ACTIVE" ? "amber" : "green"} />
      <ActionButton tooltipText="Xem và xếp học viên" icon={HiOutlineUserGroup} onClick={() => onSelectClass(row.original)} color="secondary" />
    </div> },
  ], [showVersion, onEditClass, onSelectClass, onToggleStatus]);
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "text", id: "name", label: "Tên hoặc mã lớp", placeholder: "Nhập tên hoặc mã lớp..." },
    { type: "select", id: "trainingProgramName", label: "Chương trình đào tạo", options: [{ value: "", label: "Tất cả chương trình" }, ...[...new Set(classes.map((item) => item.trainingProgramName).filter((name): name is string => Boolean(name)))].map((name) => ({ value: name, label: name }))] },
    { type: "select", id: "status", label: "Trạng thái", options: [{ value: "", label: "Tất cả trạng thái" }, { value: "ACTIVE", label: "Đang hoạt động" }, { value: "INACTIVE", label: "Ngừng hoạt động" }] },
  ], [classes]);

  return <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Không tìm thấy lớp học nào phù hợp" /></div>;
}

function TrainingClassOverview({ classes, isLoading }: { classes: TrainingClass[]; isLoading: boolean }) {
  const activeCount = classes.filter((item) => item.status === "ACTIVE").length;
  const stats = [
    { label: "Lớp quản lý", value: classes.length, helper: "Lớp trong phạm vi quản lý", icon: HiOutlineViewGrid, tone: "primary" },
    { label: "Đang hoạt động", value: activeCount, helper: "Lớp đang hoạt động", icon: HiOutlineCheckCircle, tone: "success" },
    { label: "Ngừng hoạt động", value: classes.length - activeCount, helper: "Lớp không còn hoạt động", icon: HiOutlineAcademicCap, tone: "neutral" },
  ] satisfies Array<{ label: string; value: number; helper: string; icon: typeof HiOutlineViewGrid; tone: DashboardTone }>;

  return <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {stats.map((item) => (
      <StatCard key={item.label} {...item} value={isLoading ? "…" : item.value.toLocaleString("vi-VN")} href="/commander/training-classes" />
    ))}
  </section>;
}
