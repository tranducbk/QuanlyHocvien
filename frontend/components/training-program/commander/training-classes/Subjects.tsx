"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { ColumnDef } from "@tanstack/react-table";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import useAssignedClassCollection from "@/hooks/training-program/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import { subjectCatalogService } from "@/services/training-program/subject-catalog";
import SubjectCatalog from "./SubjectCatalog";
import { useAuthStore } from "@/store/useAuthStore";

type Semester = { id: string; code: number; schoolYear: string };
type Subject = {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
};
type SubjectRow = Subject & {
  classId: string;
  className: string;
  semesterId: string;
  semesterName: string;
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
const matches = (row: SubjectRow, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId) &&
  (!filters.semesterName || row.semesterName === filters.semesterName) &&
  (!filters.subject ||
    normalize(`${row.subjectName} ${row.subjectCode}`).includes(
      normalize(String(filters.subject))
    ));
const sortValue = (row: SubjectRow, field: string) =>
  row[field as keyof SubjectRow];

export default function Subjects() {
  const semesters = useAssignedClassCollection<Semester>(
    "semesters",
    trainingClassService.getSemesters
  );
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [tab, setTab] = useState<"catalog" | "classes">("catalog");
  const [catalogSubjectId, setCatalogSubjectId] = useState("");
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const trainingSystemId = useAuthStore(
    (state) => state.user?.trainingSystemId
  );
  const catalogKey = [
    QUERY_KEYS.SUBJECT_CATALOG,
    semesters.commanderId,
    trainingSystemId,
  ];
  const catalog = useQuery({
    queryKey: catalogKey,
    queryFn: subjectCatalogService.list,
    enabled: Boolean(semesters.commanderId),
  });
  const pairs = semesters.rows.map((semester) => ({
    ...semester,
    semesterName: `${semester.schoolYear} · HK ${semester.code}`,
  }));
  const subjectQueries = useQueries({
    queries: pairs.map((semester) => ({
      queryKey: [
        QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
        semesters.commanderId,
        semester.classId,
        semester.id,
        "subjects",
      ],
      queryFn: () =>
        trainingClassService.getSubjects(semester.classId, semester.id),
    })),
  });
  const rows: SubjectRow[] = pairs.flatMap((semester, index) =>
    (subjectQueries[index]?.data?.data ?? []).map((subject) => ({
      ...subject,
      classId: semester.classId,
      className: semester.className,
      semesterId: semester.id,
      semesterName: semester.semesterName,
    }))
  );
  const table = useClientTableData(rows, matches, sortValue);
  const create = useMutation({
    mutationFn: () =>
      trainingClassService.createSubject(classId, semesterId, {
        catalogSubjectId,
      }),
    onSuccess: async () => {
      setCatalogSubjectId("");
      setMessage("Đã thêm môn học vào lớp.");
      await client.invalidateQueries({
        queryKey: [
          QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
          semesters.commanderId,
          classId,
          semesterId,
          "subjects",
        ],
      });
    },
    onError: (error) =>
      setMessage(
        isAxiosError(error)
          ? error.response?.data?.message || "Không thêm được môn học."
          : "Không thêm được môn học."
      ),
  });
  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      { id: "className", header: "Lớp", accessorKey: "className" },
      { id: "semesterName", header: "Học kỳ", accessorKey: "semesterName" },
      { id: "subjectCode", header: "Mã môn", accessorKey: "subjectCode" },
      { id: "subjectName", header: "Tên môn", accessorKey: "subjectName" },
      { id: "credits", header: "Tín chỉ", accessorKey: "credits" },
    ],
    []
  );
  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        id: "classId",
        label: "Lớp",
        options: [
          { value: "", label: "Tất cả lớp" },
          ...semesters.assignedClasses.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        ],
      },
      {
        type: "select",
        id: "semesterName",
        label: "Học kỳ",
        options: [
          { value: "", label: "Tất cả học kỳ" },
          ...[...new Set(pairs.map((item) => item.semesterName))].map(
            (value) => ({ value, label: value })
          ),
        ],
      },
      {
        type: "text",
        id: "subject",
        label: "Môn học",
        placeholder: "Tên hoặc mã môn...",
      },
    ],
    [semesters.assignedClasses, pairs]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Môn học" },
      ]}
      title="Môn học"
      subtitle="Tạo danh mục môn một lần, chọn để thêm vào lớp và học kỳ."
      isError={
        catalog.isError ||
        semesters.isError ||
        subjectQueries.some((query) => query.isError)
      }
      onRetry={() => {
        void catalog.refetch();
        semesters.refetch();
        subjectQueries.forEach((query) => {
          void query.refetch();
        });
      }}
    >
      <div className="flex gap-2" role="group" aria-label="Chế độ xem môn học">
        <Button
          variant={tab === "catalog" ? "primary" : "outline"}
          aria-pressed={tab === "catalog"}
          onClick={() => setTab("catalog")}
        >
          Danh mục môn học
        </Button>
        <Button
          variant={tab === "classes" ? "primary" : "outline"}
          aria-pressed={tab === "classes"}
          onClick={() => setTab("classes")}
        >
          Môn học của lớp
        </Button>
      </div>
      {tab === "catalog" ? (
        catalog.isLoading ? (
          <p>Đang tải danh mục môn...</p>
        ) : (
          <SubjectCatalog
            items={catalog.data?.data ?? []}
            onSelect={(id) => {
              setCatalogSubjectId(id);
              setMessage("");
              setTab("classes");
            }}
            onSaved={() => client.invalidateQueries({ queryKey: catalogKey })}
          />
        )
      ) : (
        <>
          <form
            className="grid gap-4 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              create.mutate();
            }}
          >
            <Select
              label="Lớp"
              placeholder="Chọn lớp để thêm môn"
              required
              value={classId}
              onChange={(value) => {
                setClassId(String(value));
                setSemesterId("");
              }}
              options={semesters.assignedClasses.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.code})`,
              }))}
            />
            <Select
              label="Học kỳ"
              placeholder="Chọn học kỳ"
              required
              value={semesterId}
              onChange={(value) => setSemesterId(String(value))}
              disabled={!classId}
              options={pairs
                .filter((item) => item.classId === classId)
                .map((item) => ({ value: item.id, label: item.semesterName }))}
            />
            <Select
              label="Môn học"
              placeholder="Chọn từ danh mục môn"
              required
              value={catalogSubjectId}
              onChange={(value) => setCatalogSubjectId(String(value))}
              options={(catalog.data?.data ?? []).map((item) => ({
                value: item.id,
                label: `${item.subjectCode} · ${item.subjectName} (${item.credits} tín chỉ)`,
              }))}
            />
            <Button
              type="submit"
              isLoading={create.isPending}
              disabled={!classId || !semesterId || !catalogSubjectId}
            >
              Thêm môn vào lớp
            </Button>
          </form>
          {message && <p role="status">{message}</p>}
          {semesters.isLoading ||
          subjectQueries.some((query) => query.isLoading) ? (
            <p>Đang tải môn học...</p>
          ) : (
            <div className="px-4">
              <Table
                data={table.data}
                columns={columns}
                pagination={table.pagination}
                onPaginationChange={table.setPagination}
                columnFilters={table.columnFilters}
                onColumnFiltersChange={table.onColumnFiltersChange}
                sorting={table.sorting}
                onSortingChange={table.onSortingChange}
                filterFields={filterFields}
                emptyText="Chưa có môn học phù hợp"
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
