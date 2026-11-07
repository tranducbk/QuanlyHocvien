"use client";

import {
  AiOutlineArrowLeft,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineTeam,
} from "@/library/icons";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Button from "@/library/Button";
import Input from "@/library/Input";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import useAppMutation from "@/hooks/useAppMutation";
import useClientTableData from "@/hooks/useClientTableData";
import { QUERY_KEYS } from "@/constants/query-keys";
import { he5PlacementService as service } from "@/services/training-program/he5-placement";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import type {
  AvailableStudent,
  FixedClass,
  PlacementDetail,
} from "@/types/training-program/he5-placement";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
const matchAll = () => true;
const sortValue = <T,>(row: T, field: string) =>
  row[field as keyof T] as string | number | null;

export default function He5Main({
  screen = "classes",
  initialYearId = "",
  classId = "",
}: {
  screen?: "classes" | "students";
  initialYearId?: string;
  classId?: string;
}) {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const queryKey = [QUERY_KEYS.HE5_PLACEMENT, userId];
  const [selectedYear, setSelectedYear] = useState(initialYearId);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const openModal = useModalStore((state) => state.openModal);
  const yearsQuery = useQuery({
    queryKey: [...queryKey, "years"],
    queryFn: service.years,
    enabled: Boolean(userId),
  });
  const years = yearsQuery.data?.data ?? [];
  const yearId = selectedYear || years[0]?.id || "";
  const detailQuery = useQuery({
    queryKey: [...queryKey, yearId, "detail"],
    queryFn: () => service.detail(yearId),
    enabled: Boolean(userId && yearId),
  });
  const detail = detailQuery.data?.data;
  const prepare = useAppMutation({
    mutationFn: service.prepareNext,
    invalidateQueryKey: queryKey,
    successMessage: "Đã kế thừa danh sách cho năm học mới",
    onSuccess: (response) => {
      if (response.data) setSelectedYear(response.data.id);
    },
  });
  const overviewHref = `/commander/training-classes?yearId=${yearId}`;
  const close = useAppMutation({
    mutationFn: () => service.close(yearId),
    invalidateQueryKey: queryKey,
    successMessage: "Đã chốt xếp lớp cho toàn Hệ 5",
    onSuccess: () => router.push(overviewHref),
  });
  const canPrepare = years[0]?.status === "CLOSED";
  const graduated =
    detail?.placements.filter((row) => row.status === "GRADUATED").length ?? 0;
  const active =
    detail?.placements.filter((row) => row.status === "ACTIVE").length ?? 0;
  const selectedClass = detail?.classes.find((row) => row.id === classId);
  const className = selectedClass?.name ?? "Lớp…";
  const titles = {
    classes: "Quản lý lớp học · Hệ 5",
    students: "Danh sách học viên · Hệ 5",
  };
  const editClass = (trainingClass: FixedClass, addStudent = false) =>
    openModal({
      title: `Chỉnh sửa danh sách · ${trainingClass.name} · ${detail?.year.schoolYear ?? ""}`,
      content: (
        <ClassEditor
          key={`${yearId}:${trainingClass.id}:${addStudent}`}
          yearId={yearId}
          classId={trainingClass.id}
          initialMode={addStudent ? "UNASSIGNED" : "ACTIVE"}
        />
      ),
      size: "2xl",
    });
  const backLink = (
    <Link
      href={overviewHref}
      aria-label="Quay lại danh sách lớp"
      title="Quay lại danh sách lớp"
      className="inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      <AiOutlineArrowLeft size={20} aria-hidden="true" />
    </Link>
  );

  return (
    <PageContainer
      title={screen === "students" ? undefined : titles[screen]}
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        {
          label: "Quản lý lớp",
          ...(screen !== "classes" ? { href: overviewHref } : {}),
        },
        ...(screen === "students" ? [{ label: className }] : []),
      ]}
      isError={yearsQuery.isError || detailQuery.isError}
      onRetry={() => {
        void yearsQuery.refetch();
        void detailQuery.refetch();
      }}
      className="!min-h-0 !space-y-3 !p-4"
      actions={
        screen === "classes" ? (
          <>
            <div className="w-44 shrink-0">
              <Select
                size="sm"
                label="Năm học"
                value={yearId}
                onChange={(value) => setSelectedYear(String(value))}
                options={years.map((year) => ({
                  value: year.id,
                  label: year.schoolYear,
                }))}
              />
            </div>
            {canPrepare && (
              <Button
                size="sm"
                isLoading={prepare.isPending}
                onClick={() =>
                  openConfirm({
                    title: "Chuẩn bị năm học mới",
                    message: `Kế thừa danh sách ${years[0].schoolYear} sang ${years[0].startYear + 1}–${years[0].startYear + 2}, không đưa học viên đã tốt nghiệp vào lớp.`,
                    onConfirm: () => prepare.mutate(),
                  })
                }
              >
                Chuẩn bị năm học mới
              </Button>
            )}
            {detail?.year.status === "DRAFT" && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={close.isPending}
                onClick={() =>
                  openConfirm({
                    title: `Chốt danh sách ${detail.year.schoolYear}`,
                    message: `Chốt danh sách toàn Hệ 5: ${active} học viên trong lớp, ${graduated} học viên tốt nghiệp. Sau chốt không thể chỉnh sửa danh sách của năm này.`,
                    confirmText: "Chốt danh sách",
                    variant: "warning",
                    onConfirm: () => close.mutate(),
                  })
                }
              >
                Chốt danh sách
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      {screen === "students" && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {backLink}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-2xl">
                Danh sách lớp
              </h1>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {detail
                  ? `${selectedClass?.studentCount ?? 0} học viên`
                  : "Đang tải…"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-lg bg-primary-50 px-3 py-2 font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {className}
            </span>
            <span className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              Năm học {detail?.year.schoolYear ?? "…"}
            </span>
          </div>
        </div>
      )}
      {yearsQuery.isLoading && <p>Đang tải năm học...</p>}
      {!yearsQuery.isLoading && !yearsQuery.isError && !years.length && (
        <p>Chưa có dữ liệu năm học.</p>
      )}
      {detailQuery.isLoading && yearId && <p>Đang tải danh sách lớp...</p>}
      {detail && (
        <>
          {screen === "classes" && (
            <ClassList
              classes={detail.classes}
              onSelect={(id) =>
                router.push(
                  `/commander/training-classes/${yearId}/students?classId=${id}`
                )
              }
              onEdit={editClass}
              editable={detail.year.status === "DRAFT"}
            />
          )}
          {screen === "students" && (
            <Roster
              key={`${yearId}:${classId}`}
              detail={detail}
              classId={classId}
              readOnly
              available={[]}
              availableLoading={false}
              availableError={false}
              onRetryAvailable={() => {}}
              queryKey={queryKey}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}

function ClassList({
  classes,
  onSelect,
  onEdit,
  editable,
}: {
  classes: FixedClass[];
  onSelect: (id: string) => void;
  onEdit: (trainingClass: FixedClass, addStudent?: boolean) => void;
  editable: boolean;
}) {
  const table = useClientTableData(classes, matchAll, sortValue);
  const actionClassName = "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950";
  const columns: ColumnDef<FixedClass>[] = [
    { accessorKey: "name", header: "Tên lớp", size: 220,
      cell: ({ row }) => <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <AiOutlineTeam className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{row.original.name}</span>
      </div> },
    { accessorKey: "studentCount", header: "Số học viên", size: 160,
      cell: ({ row }) => <span className={`text-sm font-semibold tabular-nums ${row.original.studentCount ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-500"}`}>{row.original.studentCount}</span> },
    {
      id: "universityCodes", header: "Cơ sở đào tạo", size: 260, enableSorting: false,
      cell: ({ row }) => row.original.universityCodes?.length ?
        <div className="flex flex-wrap gap-1.5">{row.original.universityCodes.map(code =>
          <span key={code} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">{code}</span>
        )}</div> : <span className="text-neutral-400">—</span>,
    },
    {
      id: "actions",
      header: "Thao tác",
      size: 170,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Xem học viên ${row.original.name}`}
            title={`Xem học viên ${row.original.name}`}
            className={actionClassName}
            onClick={() => onSelect(row.original.id)}
          >
            <AiOutlineEye className="h-5 w-5" aria-hidden="true" />
          </button>
          {editable && (
            <button type="button"
              aria-label={`Thêm học viên vào ${row.original.name}`}
              title={`Thêm học viên vào ${row.original.name}`}
              onClick={() => onEdit(row.original, true)}
              className={actionClassName}>
              <AiOutlinePlus className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          {editable && (
            <button
              type="button"
              aria-label={`Chỉnh sửa danh sách ${row.original.name}`}
              title={`Chỉnh sửa danh sách ${row.original.name}`}
              onClick={() => onEdit(row.original)}
              className={actionClassName}
            >
              <AiOutlineEdit className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];
  return (
    <section aria-label="Danh sách lớp">
      <Table
        data={table.data}
        columns={columns}
        pagination={table.pagination}
        onPaginationChange={table.setPagination}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        compact
        fitToContainer
        showPagination={false}
        rowClassName="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
        className="[&_thead_th]:!py-2 [&_tbody_td]:!py-1.5"
      />
    </section>
  );
}

function ClassEditor({ yearId, classId, initialMode = "ACTIVE" }: { yearId: string; classId: string; initialMode?: "ACTIVE" | "UNASSIGNED" }) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryKey = [QUERY_KEYS.HE5_PLACEMENT, userId];
  const detailQuery = useQuery({
    queryKey: [...queryKey, yearId, "detail"],
    queryFn: () => service.detail(yearId),
    enabled: Boolean(userId),
  });
  const detail = detailQuery.data?.data;
  const availableQuery = useQuery({
    queryKey: [...queryKey, yearId, "available"],
    queryFn: () => service.available(yearId),
    enabled: Boolean(userId && detail?.year.status === "DRAFT"),
  });
  if (detailQuery.isError)
    return (
      <Button variant="secondary" onClick={() => void detailQuery.refetch()}>
        Tải lại danh sách
      </Button>
    );
  if (!detail) return <p>Đang tải danh sách lớp...</p>;
  return (
    <div className="max-h-[70dvh] overflow-y-auto pr-1">
      <Roster
        detail={detail}
        classId={classId}
        readOnly={false}
        initialMode={initialMode}
        available={availableQuery.data?.data ?? []}
        availableLoading={availableQuery.isLoading}
        availableError={availableQuery.isError}
        onRetryAvailable={() => void availableQuery.refetch()}
        queryKey={queryKey}
      />
    </div>
  );
}

interface RosterRow {
  profileId: string;
  studentCode: string;
  fullName: string | null;
  trainingClassId: string | null;
  previousClassId: string | null;
  status: string;
}
const matches = (row: RosterRow, filters: Record<string, unknown>) =>
  !filters.search ||
  normalize(`${row.studentCode} ${row.fullName ?? ""}`).includes(
    normalize(String(filters.search))
  );

function Roster({
  detail,
  classId,
  readOnly,
  available,
  availableLoading,
  availableError,
  onRetryAvailable,
  queryKey,
  initialMode = "ACTIVE",
}: {
  detail: PlacementDetail;
  classId: string;
  readOnly: boolean;
  available: AvailableStudent[];
  availableLoading: boolean;
  availableError: boolean;
  onRetryAvailable: () => void;
  queryKey: (string | undefined)[];
  initialMode?: "ACTIVE" | "UNASSIGNED";
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<string>(initialMode);
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [choosingClass, setChoosingClass] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const editable = !readOnly && detail.year.status === "DRAFT";
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const resetSelection = () => {
    setSelected([]);
    setTarget("");
    setChoosingClass(false);
    setStudentSearch("");
  };
  const assign = useAppMutation({
    mutationFn: () =>
      service.assign(
        detail.year.id,
        selected,
        mode === "ACTIVE" ? target : classId
      ),
    invalidateQueryKey: queryKey,
    successMessage: "Đã cập nhật bản nháp xếp lớp",
    onSuccess: async () => { resetSelection(); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILES] }); },
  });
  const graduate = useAppMutation({
    mutationFn: () => service.graduate(detail.year.id, selected),
    invalidateQueryKey: queryKey,
    successMessage: "Đã đánh dấu tốt nghiệp trong bản nháp",
    onSuccess: async () => { resetSelection(); await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILES] }); },
  });
  const busy = assign.isPending || graduate.isPending;
  const classNames = useMemo(
    () => new Map(detail.classes.map((row) => [row.id, row.name])),
    [detail.classes]
  );
  const searchTerm = normalize(studentSearch.trim());
  const suggestions = searchTerm
    ? available
        .filter(
          (row) =>
            !selected.includes(row.id) &&
            normalize(`${row.fullName ?? ""} ${row.code}`).includes(searchTerm)
        )
        .slice(0, 10)
    : [];
  const rows: RosterRow[] =
    mode === "UNASSIGNED"
      ? available
          .filter((row) => selected.includes(row.id))
          .map((row) => ({
            profileId: row.id,
            studentCode: row.code,
            fullName: row.fullName,
            trainingClassId: null,
            previousClassId: null,
            status: "UNASSIGNED",
          }))
      : detail.placements.filter(
          (row) =>
            row.status === mode && (!classId || row.trainingClassId === classId)
        );
  const table = useClientTableData(rows, matches, sortValue);
  const columns: ColumnDef<RosterRow>[] = [
    ...(editable
      ? [
          {
            id: "select",
            header: "Chọn",
            enableSorting: false,
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Chọn ${row.original.studentCode}`}
                disabled={busy}
                checked={selected.includes(row.original.profileId)}
                onChange={(event) => {
                  setChoosingClass(false);
                  setTarget("");
                  setSelected((ids) =>
                    event.target.checked
                      ? [...ids, row.original.profileId]
                      : ids.filter((id) => id !== row.original.profileId)
                  );
                }}
              />
            ),
          } satisfies ColumnDef<RosterRow>,
        ]
      : []),
    { accessorKey: "studentCode", header: "Mã học viên" },
    { accessorKey: "fullName", header: "Họ tên" },
    ...(readOnly
      ? [
          {
            id: "previous",
            header: "Lớp năm trước",
            cell: ({ row }) =>
              classNames.get(row.original.previousClassId ?? "") ?? "—",
          } satisfies ColumnDef<RosterRow>,
          {
            id: "class",
            header: "Lớp hiện tại",
            cell: ({ row }) =>
              classNames.get(row.original.trainingClassId ?? "") ??
              "Chưa xếp lớp",
          } satisfies ColumnDef<RosterRow>,
        ]
      : []),
    ...(editable && mode === "ACTIVE"
      ? [
          {
            id: "actions",
            header: "Thao tác",
            enableSorting: false,
            cell: ({ row }) => (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setSelected([row.original.profileId]);
                  setTarget("");
                  setChoosingClass(true);
                }}
              >
                Chuyển lớp
              </Button>
            ),
          } satisfies ColumnDef<RosterRow>,
        ]
      : []),
  ];
  return (
    <section className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ACTIVE", name: "Danh sách lớp" },
            { id: "GRADUATED", name: "Tốt nghiệp" },
            ...(editable ? [{ id: "UNASSIGNED", name: "Thêm học viên" }] : []),
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              disabled={busy}
              variant={mode === tab.id ? "primary" : "secondary"}
              onClick={() => {
                setMode(tab.id);
                resetSelection();
              }}
            >
              {tab.name}
            </Button>
          ))}
        </div>
      )}
      {mode === "UNASSIGNED" && (
        <div className="space-y-2">
          <Input
            label="Tìm học viên chưa xếp lớp"
            placeholder="Nhập tên học viên..."
            type="search"
            autoComplete="off"
            prefixIcon={<AiOutlineSearch size={18} />}
            value={studentSearch}
            disabled={busy || availableLoading || availableError}
            onChange={(event) => setStudentSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setStudentSearch("");
            }}
          />
          {searchTerm && !availableLoading && !availableError && (
            <ul
              aria-label="Gợi ý học viên chưa xếp lớp"
              className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950"
            >
              {suggestions.length ? (
                suggestions.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setSelected((ids) =>
                          ids.includes(student.id) ? ids : [...ids, student.id]
                        );
                        setStudentSearch("");
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-neutral-900 dark:focus-visible:bg-neutral-900"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {student.fullName || student.code}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {student.code}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-300">
                        Chọn
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-neutral-500">
                  Không tìm thấy học viên chưa xếp lớp phù hợp.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
      {mode === "GRADUATED" && (
        <p className="text-sm text-neutral-500">
          Những học viên này không tính vào sĩ số năm này.{" "}
          {editable
            ? "Nếu đánh dấu nhầm, chọn học viên và xếp lại vào lớp trước khi chốt."
            : "Hồ sơ và danh sách những năm trước vẫn được giữ nguyên."}
        </p>
      )}
      {editable && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
          <span className="mr-auto text-sm text-neutral-500">
            Đã chọn {selected.length} học viên
          </span>
          {mode === "ACTIVE" ? (
            <Button
              size="sm"
              disabled={selected.length > 500 || busy}
              onClick={() => {
                setTarget("");
                setChoosingClass(true);
              }}
            >
              Chuyển lớp
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={selected.length > 500 || busy}
              isLoading={assign.isPending}
              onClick={() => assign.mutate()}
            >
              {mode === "GRADUATED" ? "Khôi phục vào lớp" : "Thêm vào lớp"}
            </Button>
          )}
          {mode === "ACTIVE" && (
            <Button
              variant="secondary"
              disabled={!selected.length || selected.length > 500 || busy}
              isLoading={graduate.isPending}
              onClick={() =>
                openConfirm({
                  title: "Đánh dấu tốt nghiệp",
                  message: `Đánh dấu ${selected.length} học viên tốt nghiệp và không đưa vào danh sách lớp ${detail.year.schoolYear}. Dữ liệu các năm trước vẫn giữ nguyên.`,
                  onConfirm: () => graduate.mutate(),
                })
              }
            >
              Đánh dấu tốt nghiệp
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={!selected.length || busy}
            onClick={resetSelection}
          >
            Bỏ chọn
          </Button>
          {selected.length > 500 && (
            <p className="text-sm text-red-600">
              Mỗi lần xử lý tối đa 500 học viên.
            </p>
          )}
        </div>
      )}
      <div
        className={
          choosingClass
            ? "grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_12rem]"
            : ""
        }
      >
        <div className="min-w-0">
          {mode === "UNASSIGNED" && availableLoading ? (
            <p>Đang tải học viên chưa xếp lớp...</p>
          ) : mode === "UNASSIGNED" && availableError ? (
            <Button variant="secondary" onClick={onRetryAvailable}>
              Thử tải lại học viên chưa xếp lớp
            </Button>
          ) : (
            <Table
              data={table.data}
              columns={columns}
              pagination={table.pagination}
              onPaginationChange={table.setPagination}
              sorting={table.sorting}
              onSortingChange={table.onSortingChange}
              columnFilters={table.columnFilters}
              onColumnFiltersChange={table.onColumnFiltersChange}
              filterFields={
                mode === "UNASSIGNED"
                  ? undefined
                  : [
                      {
                        type: "text",
                        id: "search",
                        label: "Tìm học viên",
                        placeholder: "Mã hoặc họ tên học viên",
                      },
                    ]
              }
              compact
              showPagination={table.data.pagination.totalPages > 1}
              className="[&_thead_th]:!py-3 [&_tbody_td:not([colspan])]:!py-2"
              emptyText={
                mode === "UNASSIGNED"
                  ? "Tìm và chọn học viên để thêm vào lớp"
                  : "Không có học viên trong danh sách này"
              }
            />
          )}
        </div>
        {editable && mode === "ACTIVE" && choosingClass && (
          <aside
            aria-label="Chọn lớp chuyển đến"
            className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <fieldset disabled={busy} className="space-y-2">
              <legend className="mb-2 text-sm font-semibold">
                Chuyển đến lớp
              </legend>
              {detail.classes
                .filter((row) => row.id !== classId)
                .map((row) => (
                  <label
                    key={row.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${target === row.id ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300" : "border-neutral-200 bg-white hover:border-primary-300 dark:border-neutral-700 dark:bg-neutral-950"}`}
                  >
                    <input
                      type="radio"
                      name={`transfer-class-${classId}`}
                      value={row.id}
                      checked={target === row.id}
                      onChange={() => setTarget(row.id)}
                      className="accent-primary-600"
                    />
                    {row.name}
                  </label>
                ))}
            </fieldset>
            <Button
              size="sm"
              fullWidth
              disabled={
                !target || !selected.length || selected.length > 500 || busy
              }
              isLoading={assign.isPending}
              onClick={() => assign.mutate()}
            >
              Xác nhận chuyển
            </Button>
            <Button
              size="sm"
              fullWidth
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setChoosingClass(false);
                setTarget("");
              }}
            >
              Hủy
            </Button>
          </aside>
        )}
      </div>
    </section>
  );
}
