"use client";

import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";

const dayLabel = (day: number) => day === 7 ? "Chủ nhật" : `Thứ ${day + 1}`;

export default function StudentMilitaryTimeTablePage() {
  const query = useQuery({ queryKey: [QUERY_KEYS.MILITARY_TIME_TABLES, "me"], queryFn: militaryAcademicService.getMyTimeTable });
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/student" }, { label: "Lịch học theo lớp" }]} title="Lịch học theo lớp" isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()}>
    <div className="space-y-4">{query.data?.data?.map(table => <section key={table.id} className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">{table.MilitarySemester?.schoolYear} · Học kỳ {table.MilitarySemester?.code}</h2><ul className="divide-y">{table.schedules.map((item, index) => <li key={`${item.day}-${item.startTime}-${index}`} className="p-3">{dayLabel(item.day)} · {item.startTime}–{item.endTime} · {item.subjectName} · {item.room || "Chưa có phòng"}{item.week?.length ? ` · Tuần ${item.week.join(", ")}` : ""}</li>)}</ul></section>)}{!query.data?.data?.length && <p className="rounded-xl border p-5 text-center text-neutral-500">Chưa có lịch học cho lớp của bạn.</p>}</div>
  </PageContainer>;
}
