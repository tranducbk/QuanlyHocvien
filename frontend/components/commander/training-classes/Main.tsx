"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-classes";
import { useAuthStore } from "@/store/useAuthStore";

const systemNames: Record<string, string> = {
  HE_1: "Hệ 1",
  HE_3: "Hệ 3",
  HE_4: "Hệ 4",
  HE_7: "Hệ 7",
};

export default function Main({ systemCode, view }: { systemCode: string; view: "overview" | "classes" }) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const queryClient = useQueryClient();
  const commanderId = useAuthStore((state) => state.user?.id);
  const classesQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
    queryFn: trainingClassService.getMine,
    enabled: Boolean(commanderId),
  });
  const classes = classesQuery.data?.data ?? [];
  const systemName = systemNames[systemCode] ?? "Hệ đào tạo";
  const isOverview = view === "overview";
  const visibleClasses = isOverview ? classes.slice(0, 3) : classes;
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, selectedClassId, "students"],
    queryFn: () => trainingClassService.getStudents(selectedClassId),
    enabled: Boolean(commanderId && selectedClassId),
  });
  const assignStudent = useMutation({
    mutationFn: () => trainingClassService.assignStudent(selectedClassId, studentCode.trim()),
    onSuccess: async () => {
      setStudentCode("");
      setAssignmentMessage("Đã xếp học viên vào lớp.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, selectedClassId, "students"] });
    },
    onError: () => setAssignmentMessage("Không xếp được học viên. Kiểm tra mã học viên, Hệ và Chỉ huy quản lý."),
  });

  return (
    <PageContainer
      breadcrumb={isOverview ? [{ label: "Tổng quan" }] : [{ label: "Tổng quan", href: "/commander" }, { label: "Lớp được giao" }]}
      title={isOverview ? `Tổng quan ${systemName}` : `Lớp được giao · ${systemName}`}
      subtitle={isOverview ? "Lớp đào tạo thuộc phạm vi Chỉ huy của bạn." : "Danh sách lớp do Admin phân công cho tài khoản Chỉ huy hiện tại."}
      isError={classesQuery.isError}
      onRetry={() => { void classesQuery.refetch(); }}
    >
      {isOverview && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500">Lớp được giao</p>
          <p className="mt-2 text-3xl font-bold">{!commanderId || classesQuery.isLoading ? "…" : classes.length}</p>
          <Link href="/commander/training-classes" className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
            Xem danh sách lớp
          </Link>
        </section>
      )}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{isOverview ? "Lớp gần đây" : "Danh sách lớp"}</h2>
          {isOverview && classes.length > 3 && <Link href="/commander/training-classes" className="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">Xem tất cả</Link>}
        </div>
        {!commanderId || classesQuery.isLoading ? <p>Đang tải lớp...</p> : classes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500 dark:border-neutral-700">
            Chưa có lớp nào được phân công. Admin có thể gán Chỉ huy tại trang Lớp đào tạo.
          </p>
        ) : visibleClasses.map((item) => (
          <article key={item.id} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{item.name} <span className="font-normal text-neutral-500">({item.code})</span></h3>
              <span className="text-sm text-neutral-500">{item.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {[item.trainingProgramName, item.curriculumVersionName].filter(Boolean).join(" · ") || "Chưa gắn chương trình"}
              {item.startYear != null && ` · ${item.startYear}${item.endYear != null ? `–${item.endYear}` : ""}`}
            </p>
            {!isOverview && <button type="button" className="mt-3 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300" onClick={() => { setSelectedClassId(item.id); setAssignmentMessage(""); }}>Xem và xếp học viên</button>}
          </article>
        ))}
        {!isOverview && selectedClassId && (
          <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <h3 className="font-semibold">Học viên trong lớp</h3>
            <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); setAssignmentMessage(""); if (studentCode.trim()) assignStudent.mutate(); }}>
              <input className="rounded-lg border border-neutral-300 px-3 py-2 dark:bg-neutral-900" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} placeholder="Mã học viên đang quản lý" aria-label="Mã học viên" required />
              <button className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={assignStudent.isPending}>Xếp vào lớp</button>
            </form>
            {assignmentMessage && <p className="mt-2 text-sm" role="status">{assignmentMessage}</p>}
            {studentsQuery.isLoading ? <p className="mt-4">Đang tải học viên...</p> : studentsQuery.isError ? <p className="mt-4 text-red-600">Không tải được danh sách học viên.</p> : (
              <ul className="mt-4 space-y-2">{(studentsQuery.data?.data ?? []).map((student) => <li key={student.id}>{student.fullName} ({student.code})</li>)}</ul>
            )}
          </section>
        )}
      </section>
    </PageContainer>
  );
}
