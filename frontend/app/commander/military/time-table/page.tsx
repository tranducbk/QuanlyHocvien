"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";
import { militaryClassService } from "@/services/military-classes";
import { MilitaryScheduleItem } from "@/types/military-academic";

export default function MilitaryTimeTablePage() {
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [day, setDay] = useState("1");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [week, setWeek] = useState("");
  const [editedSchedules, setEditedSchedules] = useState<MilitaryScheduleItem[] | null>(null);
  const classes = useQuery({ queryKey: [QUERY_KEYS.MILITARY_CLASSES], queryFn: militaryClassService.getAll });
  const semesters = useQuery({ queryKey: [QUERY_KEYS.MILITARY_SEMESTERS], queryFn: militaryAcademicService.getSemesters });
  const subjects = useQuery({ queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, classId], queryFn: () => militaryAcademicService.getSubjects(classId), enabled: Boolean(classId) });
  const timetable = useQuery({ queryKey: [QUERY_KEYS.MILITARY_TIME_TABLES, classId, semesterId], queryFn: () => militaryAcademicService.getTimeTable(classId, semesterId), enabled: Boolean(classId && semesterId) });
  const schedules = editedSchedules ?? timetable.data?.data?.schedules ?? [];
  const setSchedules = (update: (rows: MilitaryScheduleItem[]) => MilitaryScheduleItem[]) => setEditedSchedules(rows => update(rows ?? timetable.data?.data?.schedules ?? []));
  const save = useMutation({ mutationFn: () => militaryAcademicService.saveTimeTable(classId, semesterId, schedules), onSuccess: async () => { setEditedSchedules(null); await client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_TIME_TABLES, classId, semesterId] }); } });
  const addItem = (event: FormEvent) => {
    event.preventDefault();
    setSchedules(items => [...items, { subjectName, day: Number(day), startTime, endTime, room: room || null, week: week ? week.split(",").map(value => Number(value.trim())).filter(Number.isFinite) : [] }]);
    setSubjectName(""); setRoom(""); setWeek("");
  };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Lịch học quân sự" }]} title="Lịch học quân sự" subtitle="Lập thời khóa biểu theo lớp và học kỳ." isLoading={classes.isLoading || semesters.isLoading} isError={classes.isError || semesters.isError} onRetry={() => { void classes.refetch(); void semesters.refetch(); }}>
    <div className="mb-4 grid gap-3 md:grid-cols-2"><label className="grid gap-1 text-sm">Lớp<select value={classId} onChange={event => { setClassId(event.target.value); setEditedSchedules(null); }} className="rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn lớp</option>{classes.data?.data?.map(row => <option key={row.id} value={row.id}>{row.classCode} · {row.className}</option>)}</select></label><label className="grid gap-1 text-sm">Học kỳ<select value={semesterId} onChange={event => { setSemesterId(event.target.value); setEditedSchedules(null); }} className="rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn học kỳ</option>{semesters.data?.data?.map(row => <option key={row.id} value={row.id}>{row.schoolYear} · Học kỳ {row.code}</option>)}</select></label></div>
    <form onSubmit={addItem} className="mb-4 grid gap-3 rounded-xl border p-4 md:grid-cols-4"><select required value={subjectName} onChange={event => setSubjectName(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900"><option value="">Chọn môn</option>{subjects.data?.data?.filter(item => item.semesterId === semesterId).map(item => <option key={item.id} value={item.subjectName}>{item.subjectName}</option>)}</select><select value={day} onChange={event => setDay(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900">{[1,2,3,4,5,6,7].map(value => <option key={value} value={value}>{value === 7 ? "Chủ nhật" : `Thứ ${value + 1}`}</option>)}</select><input required type="time" value={startTime} onChange={event => setStartTime(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><input required type="time" value={endTime} onChange={event => setEndTime(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><input placeholder="Phòng học" value={room} onChange={event => setRoom(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><input placeholder="Tuần (vd: 1,2,3)" value={week} onChange={event => setWeek(event.target.value)} className="rounded-lg border px-3 py-2 dark:bg-neutral-900" /><button disabled={!classId || !semesterId || !subjectName} className="rounded-lg border px-4 py-2 font-semibold">Thêm tiết</button></form>
    <ul className="mb-4 divide-y rounded-xl border">{schedules.map((item, index) => <li key={`${item.day}-${item.startTime}-${index}`} className="flex items-center justify-between gap-3 p-3">{item.day === 7 ? "Chủ nhật" : `Thứ ${item.day + 1}`} · {item.startTime}–{item.endTime} · {item.subjectName} · {item.room || "Chưa có phòng"}<button type="button" onClick={() => setSchedules(rows => rows.filter((_, rowIndex) => rowIndex !== index))} className="text-red-600">Bỏ</button></li>)}{!schedules.length && <li className="p-4 text-center text-neutral-500">Chưa có tiết học.</li>}</ul>
    <button type="button" disabled={!classId || !semesterId || save.isPending} onClick={() => save.mutate()} className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-white disabled:opacity-50">Lưu lịch học</button>{save.isError && <p role="alert" className="mt-2 text-sm text-red-600">Không thể lưu lịch. Kiểm tra môn học và thời gian bị trùng.</p>}
  </PageContainer>;
}
