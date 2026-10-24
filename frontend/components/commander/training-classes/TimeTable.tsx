"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService, type TrainingClassLesson } from "@/services/training-classes";
import { useAuthStore } from "@/store/useAuthStore";

const dayName = (day: number) => day === 7 ? "Chủ nhật" : `Thứ ${day + 1}`;

export default function TimeTable() {
  const commanderId = useAuthStore((state) => state.user?.id);
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
  const classes = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId], queryFn: trainingClassService.getMine, enabled: Boolean(commanderId) });
  const semesters = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, "semesters"], queryFn: () => trainingClassService.getSemesters(classId), enabled: Boolean(commanderId && classId) });
  const subjects = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "subjects"], queryFn: () => trainingClassService.getSubjects(classId, semesterId), enabled: Boolean(commanderId && classId && semesterId) });
  const timetable = useQuery({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "time-table"], queryFn: () => trainingClassService.getTimeTable(classId, semesterId), enabled: Boolean(commanderId && classId && semesterId) });
  const schedules = edited ?? timetable.data?.data?.schedules ?? [];
  const subjectById = new Map((subjects.data?.data ?? []).map((item) => [item.id, item.subjectName]));
  const save = useMutation({
    mutationFn: () => trainingClassService.saveTimeTable(classId, semesterId, schedules),
    onSuccess: async () => {
      setEdited(null); setMessage("Đã lưu lịch học.");
      await client.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, classId, semesterId, "time-table"] });
    },
    onError: () => setMessage("Không lưu được lịch học. Kiểm tra môn, giờ và các buổi trùng lịch."),
  });
  const add = () => {
    if (!subjectId || startTime >= endTime) { setMessage("Chọn môn và giờ bắt đầu trước giờ kết thúc."); return; }
    const week = weeks.trim() ? weeks.split(",").map((value) => Number(value.trim())) : [];
    if (week.some((value) => !Number.isInteger(value) || value < 1 || value > 60)) { setMessage("Tuần học phải là số từ 1 đến 60, ngăn cách bằng dấu phẩy."); return; }
    setEdited([...schedules, { subjectId, day, startTime, endTime, room: room.trim() || null, week }]);
    setMessage("Buổi học đã thêm vào bản nháp. Bấm Lưu lịch học để ghi vào PostgreSQL.");
  };
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Lịch học" }]} title="Lịch học" subtitle="Lập lịch theo lớp và học kỳ được giao. Tuần để trống nghĩa là mọi tuần." isError={classes.isError} onRetry={() => { void classes.refetch(); }}>
    <div className="flex flex-wrap gap-3">
      <label>Lớp<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={classId} onChange={(event) => { setClassId(event.target.value); setSemesterId(""); setEdited(null); setMessage(""); }}><option value="">Chọn lớp</option>{(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
      <label>Học kỳ<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={semesterId} onChange={(event) => { setSemesterId(event.target.value); setSubjectId(""); setEdited(null); setMessage(""); }} disabled={!classId}><option value="">Chọn học kỳ</option>{(semesters.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.schoolYear} · Học kỳ {item.code}</option>)}</select></label>
    </div>
    {semesterId && <>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <label>Môn<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">Chọn môn</option>{(subjects.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.subjectCode} · {item.subjectName}</option>)}</select></label>
        <label>Thứ<select className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" value={day} onChange={(event) => setDay(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6, 7].map((value) => <option key={value} value={value}>{dayName(value)}</option>)}</select></label>
        <label>Bắt đầu<input className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
        <label>Kết thúc<input className="mt-1 block rounded-lg border p-2 dark:bg-neutral-900" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
        <label>Phòng<input className="mt-1 block w-32 rounded-lg border p-2 dark:bg-neutral-900" value={room} onChange={(event) => setRoom(event.target.value)} maxLength={100} /></label>
        <label>Tuần<input className="mt-1 block w-36 rounded-lg border p-2 dark:bg-neutral-900" value={weeks} onChange={(event) => setWeeks(event.target.value)} placeholder="1, 2, 3" /></label>
        <button type="button" className="rounded-lg border px-4 py-2" onClick={add}>Thêm buổi</button>
      </div>
      {timetable.isLoading ? <p>Đang tải lịch học...</p> : timetable.isError ? <p className="text-red-600">Không tải được lịch học.</p> : <ul className="space-y-2">{schedules.map((item, index) => <li key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"><span>{dayName(item.day)} · {item.startTime}–{item.endTime} · {subjectById.get(item.subjectId) ?? "Môn không còn trong danh sách"} · {item.room || "Chưa có phòng"} · {item.week?.length ? `Tuần ${item.week.join(", ")}` : "Mọi tuần"}</span><button type="button" className="text-red-600" onClick={() => setEdited(schedules.filter((_, row) => row !== index))}>Bỏ buổi</button></li>)}</ul>}
      {message && <p role="status">{message}</p>}
      <button type="button" className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={edited === null || save.isPending || timetable.isLoading || timetable.isError} onClick={() => { setMessage(""); save.mutate(); }}>Lưu lịch học</button>
    </>}
  </PageContainer>;
}
