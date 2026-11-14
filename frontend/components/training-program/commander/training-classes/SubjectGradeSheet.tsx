"use client";

import { AiOutlineLeft, AiOutlineRight } from "@/library/icons";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Badge from "@/library/Badge";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import {
  trainingClassAcademicService,
  type SubjectGradeInput,
  type GradeResult,
} from "@/services/academic-results/training-class-academic";
import type { TrainingClass } from "@/types/training-program/training-classes";
import { useModalStore } from "@/store/useModalStore";
import EditGrade from "./EditGrade";
import { useConfirmStore } from "@/store/useConfirmStore";

export default function SubjectGradeSheet({
  classes,
  commanderId,
  onDirtyChange,
  mode = "entry",
}: {
  classes: TrainingClass[];
  commanderId?: string;
  onDirtyChange?: (dirty: boolean) => void;
  mode?: "entry" | "view";
}) {
  const [classId, setClassId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [attemptNo, setAttemptNo] = useState(1);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const updateDirty = useCallback((value: boolean) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const semesters = useQuery({
    queryKey: [
      QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
      commanderId,
      classId,
      "semesters",
    ],
    queryFn: () => trainingClassService.getSemesters(classId),
    enabled: Boolean(classId),
  });
  const subjects = useQuery({
    queryKey: [
      QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
      commanderId,
      classId,
      semesterId,
      "subjects",
    ],
    queryFn: () => trainingClassService.getSubjects(classId, semesterId),
    enabled: Boolean(classId && semesterId),
  });
  const openSheet = (
    selectedSubjectId: string,
    selectedAttempt = attemptNo
  ) => {
    if (!classId || !semesterId || !selectedSubjectId) return;
    const subject = subjects.data?.data?.find(
      (item) => item.id === selectedSubjectId
    );
    const trainingClass = classes.find((item) => item.id === classId);
    openModal({
      title: `Bảng điểm ${subject?.subjectName ?? "môn học"} của ${trainingClass?.name ?? "lớp"}`,
      size: "full",
      config: {
        overlayClassName: "backdrop-blur-md",
        mutationKey: ["subject-grade-sheet"],
        beforeClose: () => {
          if (!dirtyRef.current) return true;
          openConfirm({
            title: "Điểm chưa lưu",
            message: "Đóng bảng điểm sẽ bỏ các thay đổi chưa lưu. Tiếp tục?",
            onConfirm: () => {
              closeConfirm();
              updateDirty(false);
              closeModal();
            },
          });
          return false;
        },
      },
      content: (
        <GradeRows
          key={`${classId}:${semesterId}:${selectedSubjectId}:${selectedAttempt}`}
          classId={classId}
          semesterId={semesterId}
          subjectId={selectedSubjectId}
          attemptNo={selectedAttempt}
          commanderId={commanderId}
          onDirtyChange={updateDirty}
          readOnly={mode === "view"}
        />
      ),
    });
  };
  return (
    <div className="space-y-5 py-5">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
        <h2 className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
          {mode === "view" ? "Xem điểm theo môn" : "Nhập điểm theo môn"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr_0.7fr]">
          <Select
            label="Lớp"
            placeholder="Chọn lớp"
            value={classId}
            disabled={dirty}
            onChange={(value) => {
              setClassId(String(value));
              setSemesterId("");
              setSubjectId("");
            }}
            options={classes.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <Select
            label="Học kỳ"
            placeholder="Chọn học kỳ"
            value={semesterId}
            disabled={!classId || dirty}
            isLoading={semesters.isLoading}
            onChange={(value) => {
              setSemesterId(String(value));
              setSubjectId("");
            }}
            options={(semesters.data?.data ?? []).map((item) => ({
              value: item.id,
              label: `${item.schoolYear} · HK ${item.code}`,
            }))}
          />
          <Select
            label="Môn học"
            placeholder="Chọn môn"
            value={subjectId}
            disabled={!semesterId || dirty}
            isLoading={subjects.isLoading}
            onChange={(value) => {
              const id = String(value);
              setSubjectId(id);
              openSheet(id);
            }}
            options={(subjects.data?.data ?? []).map((item) => ({
              value: item.id,
              label: `${item.subjectCode} · ${item.subjectName}`,
            }))}
            filter={{ enabled: true, mode: "client" }}
          />
          <Select
            label="Lần thi"
            value={attemptNo}
            disabled={dirty}
            onChange={(value) => {
              const attempt = Number(value);
              setAttemptNo(attempt);
              if (subjectId) openSheet(subjectId, attempt);
            }}
            options={Array.from({ length: 20 }, (_, index) => ({
              value: index + 1,
              label: `Lần ${index + 1}`,
            }))}
          />
        </div>
      </div>
      {dirty && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          Có thay đổi chưa lưu. Lưu hoặc hủy trước khi đổi phạm vi nhập điểm.
        </p>
      )}
      {(semesters.isError || subjects.isError) && (
        <p role="alert">
          Không tải được học kỳ/môn.{" "}
          <button
            onClick={() => {
              void semesters.refetch();
              void subjects.refetch();
            }}
          >
            Thử lại
          </button>
        </p>
      )}
      {classId && semesterId && subjectId ? (
        <Button variant="outline" onClick={() => openSheet(subjectId)}>
          {mode === "view" ? "Xem bảng điểm" : "Mở bảng điểm"}
        </Button>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700">
          <p className="font-semibold">Chưa chọn đủ phạm vi</p>
          <p className="mt-2 text-sm text-neutral-500">
            Chọn lớp, học kỳ và môn học ở phía trên để bắt đầu nhập điểm.
          </p>
        </div>
      )}
    </div>
  );
}

type Draft = {
  midterm: string;
  final: string;
  reason: string;
  resultId?: string;
  expectedMidtermScore?: number;
  expectedFinalScore?: number;
};

const scoreError = (value: string) => {
  if (!value.trim()) return "Chưa nhập điểm";
  const score = Number(value);
  return Number.isFinite(score) &&
    score >= 0 &&
    score <= 10 &&
    Math.abs(score * 100 - Math.round(score * 100)) < 1e-6
    ? undefined
    : "Từ 0–10, tối đa 2 số thập phân";
};
const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

function GradeRows({
  classId,
  semesterId,
  subjectId,
  attemptNo,
  commanderId,
  onDirtyChange,
  readOnly = false,
}: {
  classId: string;
  semesterId: string;
  subjectId: string;
  attemptNo: number;
  commanderId?: string;
  onDirtyChange: (dirty: boolean) => void;
  readOnly?: boolean;
}) {
  const client = useQueryClient();
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const [historyResult, setHistoryResult] = useState<GradeResult | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [viewPage, setViewPage] = useState(0);
  const draftCount = Object.keys(drafts).length;
  useEffect(() => {
    onDirtyChange(draftCount > 0);
  }, [draftCount, onDirtyChange]);
  const students = useQuery({
    queryKey: [
      QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
      commanderId,
      classId,
      "students",
    ],
    queryFn: () => trainingClassService.getStudents(classId),
  });
  const results = useQuery({
    queryKey: [
      QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
      commanderId,
      classId,
      "results",
      semesterId,
    ],
    queryFn: () =>
      trainingClassAcademicService.getClassResults(classId, semesterId),
  });
  const proposals = useQuery({
    queryKey: [
      QUERY_KEYS.TRAINING_CLASS_ACADEMIC,
      commanderId,
      classId,
      "pending",
    ],
    queryFn: () =>
      trainingClassAcademicService.getClassProposals(classId, "PENDING"),
  });
  const status = useQuery({
    queryKey: [
      QUERY_KEYS.TRAINING_CLASS_ACADEMIC,
      commanderId,
      classId,
      semesterId,
      "closure",
    ],
    queryFn: () =>
      trainingClassAcademicService.gradeStatus(classId, semesterId),
  });
  const closed = Boolean(status.data?.data?.gradeClosedAt);
  const resultByProfile = useMemo(
    () =>
      new Map(
        (results.data?.data ?? [])
          .filter(
            (row) => row.subjectId === subjectId && row.attemptNo === attemptNo
          )
          .map((row) => [row.profileId, row])
      ),
    [results.data, subjectId, attemptNo]
  );
  const pending = useMemo(
    () =>
      new Set(
        (proposals.data?.data ?? [])
          .filter(
            (row) => row.subjectId === subjectId && row.attemptNo === attemptNo
          )
          .map((row) => row.profileId)
      ),
    [proposals.data, subjectId, attemptNo]
  );
  const visibleStudents = useMemo(() => {
    const term = normalizeSearch(search.trim());
    return (students.data?.data ?? []).filter((student) =>
      normalizeSearch(`${student.code} ${student.fullName}`).includes(term)
    );
  }, [students.data, search]);
  const viewPageCount = Math.max(1, Math.ceil(visibleStudents.length / 10));
  const currentViewPage = Math.min(viewPage, viewPageCount - 1);
  const pageStudents = readOnly
    ? visibleStudents.slice(currentViewPage * 10, currentViewPage * 10 + 10)
    : visibleStudents;
  const updateSearch = (value: string) => {
    setSearch(value);
    setViewPage(0);
  };
  const cancel = (profileId: string) =>
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== profileId)
      )
    );
  const save = useMutation({
    mutationKey: ["subject-grade-sheet"],
    mutationFn: (profileIds: string[]) => {
      const rows: SubjectGradeInput[] = profileIds.map((profileId) => {
        const draft = drafts[profileId];
        if (!draft || scoreError(draft.midterm) || scoreError(draft.final))
          throw new Error(
            "Kiểm tra các ô điểm được đánh dấu: nhập đủ điểm 0–10, tối đa hai chữ số thập phân."
          );
        const midtermScore = Number(draft.midterm);
        const finalScore = Number(draft.final);
        if (closed && draft.reason.trim().length < 5)
          throw new Error("Sau chốt, mỗi dòng cần lý do ít nhất 5 ký tự.");
        return {
          profileId,
          resultId: draft.resultId,
          midtermScore,
          finalScore,
          reason: draft.reason.trim(),
          expectedMidtermScore: draft.expectedMidtermScore,
          expectedFinalScore: draft.expectedFinalScore,
        };
      });
      return trainingClassAcademicService.saveSubjectGrades(
        classId,
        semesterId,
        { subjectId, attemptNo, rows }
      );
    },
    onSuccess: async (_, profileIds) => {
      setDrafts((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([id]) => !profileIds.includes(id))
        )
      );
      setMessage(`Đã lưu ${profileIds.length} dòng điểm và lịch sử.`);
      await Promise.all([
        client.invalidateQueries({
          queryKey: [
            QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
            commanderId,
            classId,
            "results",
          ],
        }),
        client.invalidateQueries({
          queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, commanderId, classId],
        }),
      ]);
    },
    onError: (error) =>
      setMessage(
        isAxiosError(error)
          ? error.response?.data?.message ||
              "Không lưu được bảng điểm. Không có dòng nào được lưu."
          : error.message
      ),
  });
  const close = useMutation({
    mutationKey: ["subject-grade-sheet"],
    mutationFn: () =>
      trainingClassAcademicService.closeGrades(classId, semesterId, true),
    onSuccess: async () => {
      save.reset();
      setMessage(
        "Đã chốt toàn bộ học kỳ của lớp. Sửa hoặc bổ sung điểm sau chốt bắt buộc lý do."
      );
      await Promise.all([
        client.invalidateQueries({
          queryKey: [QUERY_KEYS.TRAINING_CLASS_ACADEMIC, commanderId, classId],
        }),
        client.invalidateQueries({
          queryKey: [
            QUERY_KEYS.COMMANDER_TRAINING_CLASSES,
            commanderId,
            classId,
          ],
        }),
      ]);
    },
    onError: (error) =>
      setMessage(
        isAxiosError(error)
          ? error.response?.data?.message || "Không chốt được học kỳ."
          : "Không chốt được học kỳ."
      ),
  });
  const busy = save.isPending || close.isPending;
  const queries = [students, results, proposals, status];
  if (historyResult)
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setHistoryResult(null)}>
          Quay lại bảng điểm
        </Button>
        <EditGrade result={historyResult} commanderId={commanderId} readOnly />
      </div>
    );
  if (queries.some((query) => query.isLoading))
    return <p>Đang tải bảng điểm...</p>;
  if (queries.some((query) => query.isError))
    return (
      <p role="alert">
        Không tải được bảng điểm.{" "}
        <button
          onClick={() =>
            queries.forEach((query) => {
              void query.refetch();
            })
          }
        >
          Thử lại
        </button>
      </p>
    );
  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white/95 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="w-full sm:w-64">
          <Input
            size="sm"
            aria-label="Tìm học viên trong bảng điểm"
            placeholder="Tìm tên hoặc mã học viên…"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && (
            <>
              <Button
                variant="outline"
                disabled={
                  draftCount > 0 ||
                  busy ||
                  closed ||
                  status.isFetching ||
                  !status.data?.data?.studentCount ||
                  !status.data?.data?.subjectCount
                }
                isLoading={close.isPending}
                onClick={() => {
                  save.reset();
                  setMessage("");
                  const report = status.data?.data;
                  openConfirm({
                    title: "Chốt toàn bộ học kỳ của lớp",
                    message: `Áp dụng cho tất cả môn trong học kỳ của lớp đang chọn, không chỉ môn đang xem. Còn ${report?.missing ?? 0} môn/học viên thiếu điểm và ${report?.pending ?? 0} đề xuất chờ duyệt. Sau chốt, sửa/bổ sung điểm bắt buộc lý do. Xác nhận chốt?`,
                    onConfirm: () => {
                      closeConfirm();
                      close.mutate();
                    },
                  });
                }}
              >
                {closed ? "Học kỳ đã chốt" : "Chốt điểm học kỳ"}
              </Button>
              <Button
                disabled={!draftCount || busy}
                isLoading={busy}
                onClick={() => {
                  setMessage("");
                  save.mutate(Object.keys(drafts));
                }}
              >
                Lưu tất cả ({draftCount})
              </Button>
              <Button
                variant="ghost"
                disabled={!draftCount || busy}
                onClick={() => {
                  setDrafts({});
                  setMessage("");
                }}
              >
                Hủy thay đổi
              </Button>
            </>
          )}
          <Button
            variant="outline"
            disabled={(!readOnly && draftCount > 0) || busy}
            onClick={() =>
              queries.forEach((query) => {
                void query.refetch();
              })
            }
          >
            Tải lại
          </Button>
        </div>
      </div>
      {message && (
        <p
          role={save.isError || close.isError ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${save.isError || close.isError ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"}`}
        >
          {message}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table
          className={`w-full text-left text-sm ${readOnly ? "table-fixed" : "min-w-[1080px]"}`}
        >
          {readOnly && (
            <colgroup>
              <col style={{ width: "26%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "24%" }} />
            </colgroup>
          )}
          <caption className="sr-only">
            Bảng điểm học viên, lần thi {attemptNo}.
          </caption>
          <thead className="sticky top-0 z-10 bg-neutral-100 text-xs uppercase text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-neutral-100 p-3 dark:bg-neutral-900"
              >
                Học viên
              </th>
              {readOnly && (
                <th scope="col" className="p-3">
                  Mã học viên
                </th>
              )}
              <th
                scope="col"
                className={`p-3 ${readOnly ? "text-center" : ""}`}
              >
                Giữa kỳ
              </th>
              <th
                scope="col"
                className={`p-3 ${readOnly ? "text-center" : ""}`}
              >
                Cuối kỳ
              </th>
              <th
                scope="col"
                className={`p-3 ${readOnly ? "text-center" : ""}`}
              >
                Tổng
              </th>
              <th scope="col" className="p-3">
                Trạng thái
              </th>
              {!readOnly && (
                <>
                  <th scope="col" className="p-3">
                    Lý do{closed ? " *" : " (nếu có)"}
                  </th>
                  <th scope="col" className="p-3">
                    Thao tác
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {pageStudents.map((student) => {
              const result = resultByProfile.get(student.id);
              const draft = drafts[student.id];
              const current = draft ?? {
                midterm: result?.midtermScore ?? "",
                final: result?.finalScore ?? "",
                reason: "",
                resultId: result?.id,
                expectedMidtermScore: result
                  ? Number(result.midtermScore)
                  : undefined,
                expectedFinalScore: result
                  ? Number(result.finalScore)
                  : undefined,
              };
              const change = (
                field: "midterm" | "final" | "reason",
                value: string
              ) =>
                setDrafts((previous) => ({
                  ...previous,
                  [student.id]: { ...current, [field]: value },
                }));
              const blocked = pending.has(student.id) && !result;
              const total =
                current.midterm !== "" && current.final !== ""
                  ? Math.round(
                      (Math.round(Number(current.midterm) * 100) +
                        Math.round(Number(current.final) * 100)) /
                        2
                    ) / 100
                  : null;
              return (
                <tr
                  key={student.id}
                  className={`border-b border-neutral-100 last:border-0 dark:border-neutral-800 ${draft ? "bg-primary-50/50 dark:bg-primary-950/20" : "bg-white dark:bg-neutral-950"}`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 min-w-48 p-3 font-normal ${draft ? "bg-primary-50 dark:bg-neutral-900" : "bg-white dark:bg-neutral-950"}`}
                  >
                    <p className="font-semibold">{student.fullName}</p>
                    {!readOnly && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {student.code}
                        {draft ? " · Chưa lưu" : ""}
                      </p>
                    )}
                  </th>
                  {readOnly && (
                    <td className="p-3 text-neutral-500">{student.code}</td>
                  )}
                  <td
                    className={`w-36 p-3 align-top ${readOnly ? "text-center" : ""}`}
                  >
                    {readOnly ? (
                      <span className="tabular-nums">
                        {result?.midtermScore ?? "—"}
                      </span>
                    ) : (
                      <Input
                        size="sm"
                        aria-label={`Giữa kỳ ${student.code}`}
                        aria-invalid={Boolean(
                          draft && scoreError(current.midterm)
                        )}
                        error={draft ? scoreError(current.midterm) : undefined}
                        type="number"
                        min={0}
                        max={10}
                        step="0.01"
                        disabled={blocked || busy}
                        value={current.midterm}
                        onChange={(event) =>
                          change("midterm", event.target.value)
                        }
                      />
                    )}
                  </td>
                  <td
                    className={`w-36 p-3 align-top ${readOnly ? "text-center" : ""}`}
                  >
                    {readOnly ? (
                      <span className="tabular-nums">
                        {result?.finalScore ?? "—"}
                      </span>
                    ) : (
                      <Input
                        size="sm"
                        aria-label={`Cuối kỳ ${student.code}`}
                        aria-invalid={Boolean(
                          draft && scoreError(current.final)
                        )}
                        error={draft ? scoreError(current.final) : undefined}
                        type="number"
                        min={0}
                        max={10}
                        step="0.01"
                        disabled={blocked || busy}
                        value={current.final}
                        onChange={(event) =>
                          change("final", event.target.value)
                        }
                      />
                    )}
                  </td>
                  <td
                    className={`p-3 font-semibold tabular-nums ${readOnly ? "text-center" : ""}`}
                  >
                    {readOnly
                      ? (result?.totalScore ?? "—")
                      : total === null ||
                          !Number.isFinite(total) ||
                          scoreError(current.midterm) ||
                          scoreError(current.final)
                        ? "—"
                        : total.toFixed(2)}
                  </td>
                  <td className="p-3">
                    {blocked && readOnly ? (
                      <Badge variant="warning">Chờ duyệt đề xuất</Badge>
                    ) : blocked ? (
                      <Link
                        href="/commander/approvals"
                        className="rounded text-amber-700 underline underline-offset-4 focus-visible:outline-2 dark:text-amber-300"
                      >
                        Chờ duyệt đề xuất
                      </Link>
                    ) : (
                      <Badge
                        variant={
                          draft ? "warning" : result ? "success" : "neutral"
                        }
                      >
                        {draft
                          ? "Chưa lưu"
                          : result
                            ? result.correctedAt
                              ? "Đã đính chính"
                              : "Đã ghi nhận"
                            : "Chưa có điểm"}
                      </Badge>
                    )}
                  </td>
                  {!readOnly && (
                    <>
                      <td className="min-w-52 p-2 align-top">
                        <Input
                          size="sm"
                          aria-label={`Lý do ${student.code}`}
                          aria-required={closed}
                          error={
                            draft && closed && current.reason.trim().length < 5
                              ? "Cần lý do ít nhất 5 ký tự"
                              : undefined
                          }
                          placeholder={closed ? "Bắt buộc sau chốt" : "Nếu có"}
                          maxLength={2000}
                          disabled={blocked || busy}
                          value={current.reason}
                          onChange={(event) =>
                            change("reason", event.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={!draft || blocked || busy}
                            onClick={() => {
                              setMessage("");
                              save.mutate([student.id]);
                            }}
                          >
                            {result ? "Lưu sửa" : "Ghi điểm"}
                          </Button>
                          {draft && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => cancel(student.id)}
                            >
                              Hủy
                            </Button>
                          )}
                          {result && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={draftCount > 0 || busy}
                              onClick={() => setHistoryResult(result)}
                            >
                              Lịch sử
                            </Button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!visibleStudents.length && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-neutral-500">
          {search.trim()
            ? "Không có học viên phù hợp với tìm kiếm."
            : "Lớp chưa có học viên."}
        </p>
      )}
      {readOnly && (
        <nav
          aria-label="Phân trang danh sách điểm"
          className="flex items-center justify-end gap-2 py-1"
        >
          <span className="mr-1 text-xs tabular-nums text-neutral-500">
            {currentViewPage + 1} / {viewPageCount}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 min-h-0 px-0"
              disabled={currentViewPage === 0}
              onClick={() => setViewPage(Math.max(0, currentViewPage - 1))}
              aria-label="Trang trước"
            >
              <AiOutlineLeft aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 min-h-0 px-0"
              disabled={currentViewPage >= viewPageCount - 1}
              onClick={() =>
                setViewPage(Math.min(viewPageCount - 1, currentViewPage + 1))
              }
              aria-label="Trang tiếp theo"
            >
              <AiOutlineRight aria-hidden />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
