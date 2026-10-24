"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Button from "@/library/Button";
import Input from "@/library/Input";
import PageContainer from "@/library/PageContainer";
import Select from "@/library/Select";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import useAssignedClassCollection from "@/hooks/useAssignedClassCollection";
import useClientTableData from "@/hooks/useClientTableData";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService, type TrainingClassLesson } from "@/services/training-classes";

type Semester = { id: string; code: number; schoolYear: string };
type ScheduleRow = TrainingClassLesson & { rowIndex: number; classId: string; className: string; semesterId: string; semesterName: string; subjectName: string };
const dayName = (day: number) => day === 7 ? "Chủ nhật" : `Thứ ${day + 1}`;
const normalize = (value: string) => value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const matches = (row: ScheduleRow, filters: Record<string, unknown>) =>
  (!filters.classId || row.classId === filters.classId)
  && (!filters.semesterName || row.semesterName === filters.semesterName)
  && (!filters.day || row.day === Number(filters.day))
  && (!filters.subjectName || normalize(row.subjectName).includes(normalize(String(filters.subjectName))))
  && (!filters.room || normalize(row.room ?? "").includes(normalize(String(filters.room))));
const sortValue = (row: ScheduleRow, field: string) => row[field as keyof ScheduleRow] as string | number | null;

export default function TimeTable() {
  const semesters = useAssignedClassCollection<Semester>("semesters", trainingClassService.getSemesters);
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [day, setDay] = useState(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [weeks, setWeeks] = useState("");
  const [edited, setEdited] = useState<TrainingClassLesson[] | null>(null);
  const [message, setMessage] = useState("");
  const client = useQueryClient();
  const pairs = semesters.rows.map((item) => ({ ...item, semesterName: `${item.schoolYear} · HK ${item.code}` }));
  const subjectQueries = useQueries({ queries: pairs.map((item) => ({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, semesters.commanderId, item.classId, item.id, "subjects"],
    queryFn: () => trainingClassService.getSubjects(item.classId, item.id),
  })) });
  const timetableQueries = useQueries({ queries: pairs.map((item) => ({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, semesters.commanderId, item.classId, item.id, "time-table"],
    queryFn: () => trainingClassService.getTimeTable(item.classId, item.id),
  })) });
  const selectedIndex = pairs.findIndex((item) => item.classId === classId && item.id === semesterId);
  const selectedTimetable = timetableQueries[selectedIndex];
  const selectedSubjects = subjectQueries[selectedIndex];
  const schedules = edited ?? selectedTimetable?.data?.data?.schedules ?? [];
  const rows: ScheduleRow[] = pairs.flatMap((item, index) => {
    const names = new Map((subjectQueries[index]?.data?.data ?? []).map((subject) => [subject.id, subject.subjectName]));
    const source = index === selectedIndex ? schedules : timetableQueries[index]?.data?.data?.schedules ?? [];
    return source.map((lesson, rowIndex) => ({ ...lesson, rowIndex, classId: item.classId, className: item.className, semesterId: item.id, semesterName: item.semesterName, subjectName: names.get(lesson.subjectId) ?? "Môn không còn trong danh sách" }));
  });
  const table = useClientTableData(rows, matches, sortValue);
  const save = useMutation({
    mutationFn: () => trainingClassService.saveTimeTable(classId, semesterId, schedules),
    onSuccess: async () => { setEdited(null); setMessage("Đã lưu lịch học."); await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, semesters.commanderId, classId, semesterId, "time-table"] }); },
    onError: () => setMessage("Không lưu được lịch học. Kiểm tra môn, giờ và các buổi trùng lịch."),
  });
  const add = () => {
    if (!classId || !semesterId || selectedTimetable?.isLoading || selectedTimetable?.isError || selectedSubjects?.isLoading || selectedSubjects?.isError) { setMessage("Chọn lớp và học kỳ, chờ tải lịch trước khi thêm buổi."); return; }
    if (!subjectId || startTime >= endTime) { setMessage("Chọn môn và giờ bắt đầu trước giờ kết thúc."); return; }
    const week = weeks.trim() ? weeks.split(",").map((value) => Number(value.trim())) : [];
    if (week.some((value) => !Number.isInteger(value) || value < 1 || value > 60)) { setMessage("Tuần học phải là số từ 1 đến 60, ngăn cách bằng dấu phẩy."); return; }
    setEdited([...schedules, { subjectId, day, startTime, endTime, room: room.trim() || null, week }]);
    setMessage("Buổi học đã thêm vào bản nháp. Bấm Lưu lịch học để ghi vào PostgreSQL.");
  };
  const columns: ColumnDef<ScheduleRow>[] = [
    { id: "className", header: "Lớp", accessorKey: "className" },
    { id: "semesterName", header: "Học kỳ", accessorKey: "semesterName" },
    { id: "day", header: "Thứ", accessorKey: "day", cell: ({ row }) => dayName(row.original.day) },
    { id: "startTime", header: "Giờ học", accessorKey: "startTime", cell: ({ row }) => `${row.original.startTime}–${row.original.endTime}` },
    { id: "subjectName", header: "Môn học", accessorKey: "subjectName" },
    { id: "room", header: "Phòng", accessorKey: "room", cell: ({ row }) => row.original.room || "—" },
    { id: "week", header: "Tuần", enableSorting: false, cell: ({ row }) => row.original.week?.length ? row.original.week.join(", ") : "Mọi tuần" },
    { id: "actions", header: "Hành động", enableSorting: false, cell: ({ row }) => <ActionButton tooltipText="Bỏ buổi khỏi bản nháp" icon={HiOutlineTrash} color="red" onClick={() => {
      const item = row.original;
      const index = pairs.findIndex((pair) => pair.classId === item.classId && pair.id === item.semesterId);
      const source = index === selectedIndex ? schedules : timetableQueries[index]?.data?.data?.schedules ?? [];
      if (edited && index !== selectedIndex) { setMessage("Lưu hoặc bỏ bản nháp hiện tại trước khi sửa lịch khác."); return; }
      setClassId(item.classId); setSemesterId(item.semesterId);
      setEdited(source.filter((_, position) => position !== item.rowIndex));
      setMessage("Đã bỏ buổi khỏi bản nháp. Bấm Lưu lịch học để xác nhận.");
    }} /> },
  ];
  const filterFields = useMemo<FilterField[]>(() => [
    { type: "select", id: "classId", label: "Lớp", options: [{ value: "", label: "Tất cả lớp" }, ...semesters.assignedClasses.map((item) => ({ value: item.id, label: item.name }))] },
    { type: "select", id: "semesterName", label: "Học kỳ", options: [{ value: "", label: "Tất cả học kỳ" }, ...[...new Set(pairs.map((item) => item.semesterName))].map((value) => ({ value, label: value }))] },
    { type: "select", id: "day", label: "Thứ", options: [{ value: "", label: "Tất cả" }, ...[1, 2, 3, 4, 5, 6, 7].map((value) => ({ value: String(value), label: dayName(value) }))] },
    { type: "text", id: "subjectName", label: "Môn học", placeholder: "Tên môn học..." },
    { type: "text", id: "room", label: "Phòng", placeholder: "Tên phòng..." },
  ], [semesters.assignedClasses, pairs]);
  const loading = semesters.isLoading || timetableQueries.some((query) => query.isLoading) || subjectQueries.some((query) => query.isLoading);
  const error = semesters.isError || timetableQueries.some((query) => query.isError) || subjectQueries.some((query) => query.isError);

  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Lịch học" }]} title="Lịch học" subtitle="Lịch học của tất cả lớp trong phạm vi quản lý." isError={error} onRetry={() => { semesters.refetch(); timetableQueries.forEach((query) => { void query.refetch(); }); subjectQueries.forEach((query) => { void query.refetch(); }); }}>
    <div className="grid gap-4 rounded-2xl border border-neutral-100 p-5 shadow-sm dark:border-neutral-800 md:grid-cols-3 xl:grid-cols-6">
      <Select label="Lớp" placeholder="Chọn lớp để lập lịch" value={classId} onChange={(value) => { setClassId(String(value)); setSemesterId(""); setSubjectId(""); setEdited(null); }} options={semesters.assignedClasses.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
      <Select label="Học kỳ" placeholder="Chọn học kỳ" value={semesterId} onChange={(value) => { setSemesterId(String(value)); setSubjectId(""); setEdited(null); }} disabled={!classId} options={pairs.filter((item) => item.classId === classId).map((item) => ({ value: item.id, label: item.semesterName }))} />
      <Select label="Môn" placeholder="Chọn môn" value={subjectId} onChange={(value) => setSubjectId(String(value))} disabled={!semesterId} isLoading={selectedSubjects?.isLoading} options={(selectedSubjects?.data?.data ?? []).map((item) => ({ value: item.id, label: `${item.subjectCode} · ${item.subjectName}` }))} />
      <Select label="Thứ" value={day} onChange={(value) => setDay(Number(value))} options={[1, 2, 3, 4, 5, 6, 7].map((value) => ({ value, label: dayName(value) }))} />
      <Input label="Bắt đầu" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
      <Input label="Kết thúc" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
      <Input label="Phòng" value={room} onChange={(event) => setRoom(event.target.value)} maxLength={100} />
      <Input label="Tuần" value={weeks} onChange={(event) => setWeeks(event.target.value)} placeholder="1, 2, 3" />
      <div className="flex flex-wrap gap-2 md:col-span-3 xl:col-span-6"><Button type="button" variant="outline" onClick={add} disabled={!semesterId || loading || error}>Thêm buổi</Button><Button type="button" isLoading={save.isPending} disabled={!edited || !semesterId} onClick={() => { setMessage(""); save.mutate(); }}>Lưu lịch học</Button>{edited && <Button type="button" variant="ghost" onClick={() => { setEdited(null); setMessage(""); }}>Bỏ bản nháp</Button>}</div>
    </div>
    {message && <p role="status">{message}</p>}
    {loading ? <p>Đang tải lịch học...</p> : error ? <p role="alert">Không tải được lịch học hoặc môn học.</p> : <div className="px-4"><Table data={table.data} columns={columns} pagination={table.pagination} onPaginationChange={table.setPagination} columnFilters={table.columnFilters} onColumnFiltersChange={table.onColumnFiltersChange} sorting={table.sorting} onSortingChange={table.onSortingChange} filterFields={filterFields} emptyText="Chưa có buổi học phù hợp" /></div>}
  </PageContainer>;
}
