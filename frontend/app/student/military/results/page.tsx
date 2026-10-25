"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassAcademicService as api } from "@/services/academic-results/training-class-academic";
import { useAuthStore } from "@/store/useAuthStore";

const statusLabel = { PENDING: "Đang chờ", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối" };
const classificationLabel = { FAIL: "Không đạt", AVERAGE: "Trung bình", GOOD: "Khá", EXCELLENT: "Giỏi" };

export default function StudentCohortResultsPage() {
  const studentId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [attemptNo, setAttemptNo] = useState("1");
  const [midtermScore, setMidtermScore] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const key = [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, "me", studentId];
  const subjects = useQuery({ queryKey: [...key, "subjects"], queryFn: api.getMySubjects, enabled: Boolean(studentId) });
  const results = useQuery({ queryKey: [...key, "results"], queryFn: api.getMyResults, enabled: Boolean(studentId) });
  const proposals = useQuery({ queryKey: [...key, "proposals"], queryFn: api.getMyProposals, enabled: Boolean(studentId) });
  const create = useMutation({
    mutationFn: () => api.createProposal({ subjectId, attemptNo: Number(attemptNo), midtermScore: Number(midtermScore), finalScore: Number(finalScore), reason: reason.trim() }),
    onSuccess: async () => { setSubjectId(""); setMidtermScore(""); setFinalScore(""); setReason(""); setMessage("Đã gửi đề xuất điểm."); await client.invalidateQueries({ queryKey: [...key, "proposals"] }); },
    onError: () => setMessage("Không gửi được đề xuất. Kiểm tra môn, lần thi, điểm hoặc đề xuất đang chờ."),
  });
  return <PageContainer breadcrumb={[{ label: "Tổng quan", href: "/student/military/unavailable" }, { label: "Kết quả học tập" }]} title="Kết quả học tập" subtitle="Xem điểm chính thức và đề xuất điểm cho lần thi chưa có kết quả." isError={subjects.isError || results.isError || proposals.isError} onRetry={() => { void subjects.refetch(); void results.refetch(); void proposals.refetch(); }}>
    <section className="overflow-x-auto rounded-xl border"><h2 className="p-4 font-semibold">Điểm chính thức</h2>{results.isLoading ? <p className="p-4">Đang tải...</p> : <table className="w-full text-left text-sm"><thead><tr><th className="p-3">Môn / kỳ</th><th className="p-3">Lần thi</th><th className="p-3">Giữa kỳ</th><th className="p-3">Cuối kỳ</th><th className="p-3">Tổng</th><th className="p-3">Xếp loại</th></tr></thead><tbody>{(results.data?.data ?? []).map((item) => <tr key={item.id} className="border-t"><td className="p-3">{item.trainingClassSubject?.subjectName} · {item.trainingClassSemester?.schoolYear} HK {item.trainingClassSemester?.code}</td><td className="p-3">{item.attemptNo}</td><td className="p-3">{item.midtermScore}</td><td className="p-3">{item.finalScore}</td><td className="p-3">{item.totalScore}{item.isBestAttempt ? " · Cao nhất" : ""}</td><td className="p-3">{classificationLabel[item.classification]}</td></tr>)}{!results.data?.data?.length && <tr><td className="p-4 text-center" colSpan={6}>Chưa có điểm chính thức.</td></tr>}</tbody></table>}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">Gửi đề xuất điểm</h2><p className="mb-3 text-sm text-neutral-500">Điểm giữa kỳ và cuối kỳ đều bắt buộc, mỗi điểm chiếm 50%. Đề xuất đã gửi không thể sửa hoặc xóa.</p><form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setMessage(""); create.mutate(); }}><label>Môn học<select className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" required value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">Chọn môn</option>{(subjects.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.trainingClassSemester?.schoolYear} HK {item.trainingClassSemester?.code} · {item.subjectName}</option>)}</select></label><label>Lần thi<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" required type="number" min={1} max={20} value={attemptNo} onChange={(event) => setAttemptNo(event.target.value)} /></label><label>Điểm giữa kỳ<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" required type="number" min={0} max={10} step="0.01" value={midtermScore} onChange={(event) => setMidtermScore(event.target.value)} /></label><label>Điểm cuối kỳ<input className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" required type="number" min={0} max={10} step="0.01" value={finalScore} onChange={(event) => setFinalScore(event.target.value)} /></label><label className="md:col-span-2">Lý do<textarea className="mt-1 block w-full rounded-lg border p-2 dark:bg-neutral-900" required minLength={5} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="rounded-lg bg-primary-600 px-4 py-2 text-white disabled:opacity-50" disabled={create.isPending || !subjects.data?.data?.length}>Gửi đề xuất</button></form>{message && <p className="mt-3" role="status">{message}</p>}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 font-semibold">Lịch sử đề xuất</h2>{proposals.isLoading ? <p>Đang tải...</p> : <ul className="space-y-2">{(proposals.data?.data ?? []).map((item) => <li key={item.id} className="rounded-lg border p-3">{item.trainingClassSubject?.subjectName} · Lần thi {item.attemptNo} · Giữa kỳ {item.midtermScore} · Cuối kỳ {item.finalScore} · {statusLabel[item.status]}{item.reviewNote ? ` · ${item.reviewNote}` : ""}</li>)}{!proposals.data?.data?.length && <li>Chưa có đề xuất.</li>}</ul>}</section>
  </PageContainer>;
}
