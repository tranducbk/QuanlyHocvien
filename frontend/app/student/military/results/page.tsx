"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";

const statusLabel = {
  PENDING: "Đang chờ",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export default function StudentMilitaryResultsPage() {
  const client = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [letterGrade, setLetterGrade] = useState("");
  const [gradePoint4, setGradePoint4] = useState("");
  const [gradePoint10, setGradePoint10] = useState("");
  const [reason, setReason] = useState("");
  const subjects = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_SUBJECTS, "me"],
    queryFn: militaryAcademicService.getMySubjects,
  });
  const results = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_RESULTS, "me"],
    queryFn: militaryAcademicService.getMyResults,
  });
  const proposals = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_GRADE_PROPOSALS, "me"],
    queryFn: militaryAcademicService.getMyGradeProposals,
  });
  const create = useMutation({
    mutationFn: () =>
      militaryAcademicService.createGradeProposal({
        militarySubjectId: subjectId,
        proposedLetterGrade: letterGrade.trim(),
        proposedGradePoint4: Number(gradePoint4),
        proposedGradePoint10: Number(gradePoint10),
        reason: reason.trim(),
      }),
    onSuccess: async () => {
      setSubjectId("");
      setLetterGrade("");
      setGradePoint4("");
      setGradePoint10("");
      setReason("");
      await client.invalidateQueries({
        queryKey: [QUERY_KEYS.MILITARY_GRADE_PROPOSALS, "me"],
      });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/student" },
        { label: "Kết quả học tập" },
      ]}
      title="Kết quả học tập"
      subtitle="Xem điểm chính thức và gửi đề xuất điểm để Chỉ huy xem xét."
      isLoading={subjects.isLoading || results.isLoading || proposals.isLoading}
      isError={subjects.isError || results.isError || proposals.isError}
      onRetry={() => {
        void subjects.refetch();
        void results.refetch();
        void proposals.refetch();
      }}
    >
      <section className="mb-6 overflow-x-auto rounded-xl border">
        <h2 className="p-4 text-lg font-semibold">Điểm chính thức</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3">Năm học / học kỳ</th>
              <th className="p-3">Môn</th>
              <th className="p-3">Điểm chữ</th>
              <th className="p-3">Hệ 4</th>
              <th className="p-3">Hệ 10</th>
            </tr>
          </thead>
          <tbody>
            {results.data?.data?.map((result) => (
              <tr key={result.id} className="border-t">
                <td className="p-3">
                  {result.MilitarySubject?.MilitarySemester?.schoolYear} · HK{" "}
                  {result.MilitarySubject?.MilitarySemester?.code}
                </td>
                <td className="p-3">{result.MilitarySubject?.subjectName}</td>
                <td className="p-3">{result.letterGrade}</td>
                <td className="p-3">{result.gradePoint4}</td>
                <td className="p-3">{result.gradePoint10}</td>
              </tr>
            ))}
            {!results.data?.data?.length && (
              <tr>
                <td colSpan={5} className="p-5 text-center text-neutral-500">
                  Chưa có điểm chính thức.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Gửi đề xuất điểm</h2>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <select
            required
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          >
            <option value="">Chọn môn học</option>
            {subjects.data?.data?.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.MilitarySemester?.schoolYear} · HK{" "}
                {subject.MilitarySemester?.code} · {subject.subjectName}
              </option>
            ))}
          </select>
          <input
            required
            maxLength={5}
            placeholder="Điểm chữ"
            value={letterGrade}
            onChange={(event) => setLetterGrade(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          />
          <input
            required
            type="number"
            min="0"
            max="4"
            step="0.01"
            placeholder="Điểm hệ 4"
            value={gradePoint4}
            onChange={(event) => setGradePoint4(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          />
          <input
            required
            type="number"
            min="0"
            max="10"
            step="0.01"
            placeholder="Điểm hệ 10"
            value={gradePoint10}
            onChange={(event) => setGradePoint10(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          />
          <textarea
            required
            minLength={5}
            maxLength={2000}
            placeholder="Lý do đề xuất"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-20 rounded-lg border px-3 py-2 dark:bg-neutral-900 md:col-span-2"
          />
          <button
            disabled={create.isPending || !subjects.data?.data?.length}
            className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50 md:col-span-2"
          >
            Gửi đề xuất
          </button>
          {create.isError && (
            <p role="alert" className="text-sm text-red-600 md:col-span-2">
              Không thể gửi đề xuất. Môn có điểm chính thức không nhận đề xuất
              chỉnh sửa.
            </p>
          )}
        </form>
      </section>
      <section className="overflow-x-auto rounded-xl border">
        <h2 className="p-4 text-lg font-semibold">Lịch sử đề xuất</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3">Môn</th>
              <th className="p-3">Điểm đề xuất</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Phản hồi</th>
            </tr>
          </thead>
          <tbody>
            {proposals.data?.data?.map((proposal) => (
              <tr key={proposal.id} className="border-t">
                <td className="p-3">{proposal.MilitarySubject?.subjectName}</td>
                <td className="p-3">
                  {proposal.proposedLetterGrade} ·{" "}
                  {proposal.proposedGradePoint10} / 10
                </td>
                <td className="p-3">{statusLabel[proposal.status]}</td>
                <td className="p-3">{proposal.reviewNote || "—"}</td>
              </tr>
            ))}
            {!proposals.data?.data?.length && (
              <tr>
                <td colSpan={4} className="p-5 text-center text-neutral-500">
                  Chưa gửi đề xuất nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </PageContainer>
  );
}
