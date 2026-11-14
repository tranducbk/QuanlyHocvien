"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import Input from "@/library/Input";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  trainingClassAcademicService,
  type GradeResult,
} from "@/services/academic-results/training-class-academic";

const scoreFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

const formatScore = (score: number | null | undefined) =>
  score == null ? "—" : scoreFormatter.format(score);

export default function EditGrade({
  result,
  commanderId,
  readOnly = false,
}: {
  result: GradeResult;
  commanderId?: string;
  readOnly?: boolean;
}) {
  const [midtermScore, setMidtermScore] = useState(String(result.midtermScore));
  const [finalScore, setFinalScore] = useState(String(result.finalScore));
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [savedScores, setSavedScores] = useState({
    midterm: Number(result.midtermScore),
    final: Number(result.finalScore),
  });
  const unchanged =
    Number(midtermScore) === savedScores.midterm &&
    Number(finalScore) === savedScores.final;
  const client = useQueryClient();
  const closed = Boolean(result.trainingClassSemester?.gradeClosedAt);
  const historyKey = [
    QUERY_KEYS.TRAINING_CLASS_ACADEMIC,
    commanderId,
    result.trainingClassId,
    result.id,
    "history",
  ];
  const history = useQuery({
    queryKey: historyKey,
    queryFn: () =>
      trainingClassAcademicService.history(result.trainingClassId, result.id),
  });
  const save = useMutation({
    mutationFn: () =>
      trainingClassAcademicService.updateResult(
        result.trainingClassId,
        result.id,
        {
          midtermScore: Number(midtermScore),
          finalScore: Number(finalScore),
          reason: reason.trim(),
        }
      ),
    onSuccess: async () => {
      setSavedScores({
        midterm: Number(midtermScore),
        final: Number(finalScore),
      });
      setMessage("Đã sửa điểm và lưu lịch sử.");
      setReason("");
      await Promise.all([
        client.invalidateQueries({
          queryKey: [
            QUERY_KEYS.TRAINING_CLASS_ACADEMIC,
            commanderId,
            result.trainingClassId,
          ],
        }),
        client.invalidateQueries({
          queryKey: [
            QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
            commanderId,
            result.trainingClassId,
          ],
        }),
        client.invalidateQueries({ queryKey: historyKey }),
      ]);
    },
    onError: (error) =>
      setMessage(
        isAxiosError(error)
          ? error.response?.data?.message || "Không sửa được điểm."
          : "Không sửa được điểm."
      ),
  });

  return (
    <div className="space-y-6 py-3">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {result.profile.fullName}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Mã học viên: {result.profile.code}
            </p>
          </div>
          <Badge variant={closed ? "warning" : "success"}>
            {closed ? "Học kỳ đã chốt" : "Học kỳ chưa chốt"}
          </Badge>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Môn học
            </dt>
            <dd className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
              {result.trainingClassSubject.subjectName}
              <span className="ml-1 font-normal text-neutral-500">
                ({result.trainingClassSubject.subjectCode})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Học kỳ
            </dt>
            <dd className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
              {result.trainingClassSemester.schoolYear} · HK{" "}
              {result.trainingClassSemester.code}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Lần thi
            </dt>
            <dd className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
              Lần {result.attemptNo}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {closed
            ? "Đính chính sau khi chốt cần có lý do từ 5 ký tự. Học kỳ không được mở lại."
            : "Mọi lần ghi hoặc sửa điểm đều được lưu vào lịch sử."}
        </p>
      </section>

      {!readOnly && (
        <form
          className="space-y-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800 sm:p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            save.mutate();
          }}
        >
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Cập nhật điểm
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Nhập điểm trong khoảng 0–10, tối đa hai chữ số thập phân.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="edit-grade-midterm"
              label="Điểm giữa kỳ"
              required
              type="number"
              min={0}
              max={10}
              step="0.01"
              inputMode="decimal"
              className="tabular-nums"
              disabled={save.isPending}
              value={midtermScore}
              onChange={(event) => setMidtermScore(event.target.value)}
            />
            <Input
              id="edit-grade-final"
              label="Điểm cuối kỳ"
              required
              type="number"
              min={0}
              max={10}
              step="0.01"
              inputMode="decimal"
              className="tabular-nums"
              disabled={save.isPending}
              value={finalScore}
              onChange={(event) => setFinalScore(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="edit-grade-reason"
              className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {closed ? "Lý do đính chính (bắt buộc)" : "Lý do sửa (nếu có)"}
              {closed && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
              id="edit-grade-reason"
              required={closed}
              minLength={closed ? 5 : undefined}
              maxLength={2000}
              rows={3}
              disabled={save.isPending}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-describedby="edit-grade-reason-hint"
              className="w-full resize-y rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-primary-500"
              placeholder={
                closed
                  ? "Nhập lý do đính chính (tối thiểu 5 ký tự)"
                  : "Có thể để trống trước khi chốt học kỳ"
              }
            />
            <p
              id="edit-grade-reason-hint"
              className="mt-1 text-xs text-neutral-500"
            >
              {closed
                ? `${reason.length}/2000 ký tự · tối thiểu 5 ký tự`
                : `${reason.length}/2000 ký tự`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              isLoading={save.isPending}
              disabled={
                unchanged ||
                !midtermScore ||
                !finalScore ||
                (closed && reason.trim().length < 5)
              }
            >
              Lưu điểm và lịch sử
            </Button>
            {unchanged && (
              <span className="text-sm text-neutral-500">
                Chưa có thay đổi điểm.
              </span>
            )}
          </div>
        </form>
      )}

      {message && (
        <p
          role={save.isError ? "alert" : "status"}
          aria-live={save.isError ? "assertive" : "polite"}
          className={`rounded-xl border px-4 py-3 text-sm ${save.isError ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"}`}
        >
          {message}
        </p>
      )}

      <section aria-labelledby="grade-history-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            id="grade-history-heading"
            className="font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Lịch sử điểm
          </h3>
          {!history.isLoading && !history.isError && (
            <span className="text-xs text-neutral-500">
              {history.data?.data?.length ?? 0} lần ghi nhận
            </span>
          )}
        </div>
        {history.isLoading ? (
          <p
            role="status"
            className="rounded-xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700"
          >
            Đang tải lịch sử điểm...
          </p>
        ) : history.isError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
          >
            <span>Không tải được lịch sử điểm.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void history.refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {(history.data?.data ?? []).map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.editor?.username || item.changedBy}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="mt-1 block text-xs text-neutral-500"
                    >
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </time>
                  </div>
                  <Badge variant={item.wasClosed ? "warning" : "neutral"}>
                    {item.wasClosed ? "Sau khi chốt" : "Trước khi chốt"}
                  </Badge>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/70">
                  {[
                    {
                      label: "Giữa kỳ",
                      before: item.beforeScore?.midtermScore,
                      after: item.afterScore.midtermScore,
                    },
                    {
                      label: "Cuối kỳ",
                      before: item.beforeScore?.finalScore,
                      after: item.afterScore.finalScore,
                    },
                    {
                      label: "Tổng",
                      before: item.beforeScore?.totalScore,
                      after: item.afterScore.totalScore,
                    },
                  ].map((score) => (
                    <div key={score.label}>
                      <dt className="text-xs text-neutral-500">
                        {score.label}
                      </dt>
                      <dd className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                        <span className="text-neutral-500">
                          {formatScore(score.before)}
                        </span>
                        <span className="mx-1 text-neutral-400" aria-hidden>
                          →
                        </span>
                        <span className="text-primary-700 dark:text-primary-300">
                          {formatScore(score.after)}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm text-neutral-600 dark:text-neutral-300">
                  <span className="font-semibold">Lý do: </span>
                  {item.reason ||
                    (item.beforeScore
                      ? "Không ghi lý do (trước chốt)"
                      : "Ghi nhận ban đầu")}
                </p>
              </article>
            ))}
            {!history.data?.data?.length && (
              <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Chưa có lịch sử kể từ khi bật chức năng theo dõi.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
