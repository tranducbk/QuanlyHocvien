"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineUserAdd, HiOutlineUserGroup, HiOutlineX } from "react-icons/hi";
import Button from "@/library/Button";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import { useAuthStore } from "@/store/useAuthStore";
import type { TrainingClass } from "@/types/training-program/training-classes";

interface Props {
  trainingClass: TrainingClass;
}

type AvailableStudent = { id: string; code: string; fullName: string };

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export default function TrainingClassStudentsModal({ trainingClass }: Props) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<AvailableStudent | null>(null);
  const [assigningCode, setAssigningCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const commanderId = useAuthStore((state) => state.user?.id);

  // Tải toàn bộ học viên khả dụng một lần — lọc client-side
  const availableQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, trainingClass.id, "available"],
    queryFn: () => trainingClassService.searchAvailableStudents(trainingClass.id),
    enabled: Boolean(trainingClass.id),
  });

  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, trainingClass.id, "students"],
    queryFn: () => trainingClassService.getStudents(trainingClass.id),
    enabled: Boolean(trainingClass.id),
  });

  const allAvailable: AvailableStudent[] = availableQuery.data?.data ?? [];

  // Lọc client-side theo từ khoá
  const suggestions =
    search.trim().length === 0
      ? allAvailable
      : allAvailable.filter((st) => {
          const q = normalize(search.trim());
          return normalize(st.fullName).includes(q) || normalize(st.code).includes(q);
        });

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const assignStudent = useMutation({
    mutationFn: (studentCode: string) =>
      trainingClassService.assignStudent(trainingClass.id, studentCode),
    onSuccess: async (_, studentCode) => {
      setFeedback({
        type: "success",
        message: `Đã xếp học viên ${studentCode} vào lớp ${trainingClass.name}.`,
      });
      setAssigningCode(null);
      setSelected(null);
      setSearch("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, trainingClass.id, "students"],
        }),
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId, trainingClass.id, "available"],
        }),
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.COMMANDER_TRAINING_CLASSES, commanderId],
        }),
      ]);
    },
    onError: (error: unknown) => {
      setAssigningCode(null);
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không xếp được học viên. Kiểm tra học viên và phân quyền trong Hệ.";
      setFeedback({ type: "error", message: msg });
    },
  });

  const handleSelect = (st: AvailableStudent) => {
    setSelected(st);
    setSearch(`${st.fullName} (${st.code})`);
    setShowDropdown(false);
    setFeedback(null);
  };

  const handleClear = () => {
    setSelected(null);
    setSearch("");
    setShowDropdown(false);
  };

  const handleAssign = () => {
    if (!selected) return;
    setFeedback(null);
    setAssigningCode(selected.code);
    assignStudent.mutate(selected.code);
  };

  const students = studentsQuery.data?.data ?? [];

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 py-1">
      {/* Phản hồi */}
      {feedback && (
        <div
          role="status"
          className={`rounded-xl p-3 text-sm font-medium border ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Phần 1: Tìm và thêm học viên */}
      <section className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineUserAdd className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <Typography variant="body" weight="semibold">
            Thêm học viên vào lớp
          </Typography>
        </div>

        {/* Combobox tìm kiếm với dropdown gợi ý */}
        <div className="relative" ref={containerRef}>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
                setShowDropdown(true);
                setFeedback(null);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Tìm theo mã hoặc họ tên học viên..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm placeholder-neutral-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500 dark:focus:border-primary-500 dark:focus:ring-primary-900/40"
              role="combobox"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="student-suggestion-list"
            />
            {search && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Xóa tìm kiếm"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown gợi ý */}
          {showDropdown && !selected && (
            <ul
              id="student-suggestion-list"
              role="listbox"
              className="absolute z-30 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-950 max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800"
            >
              {availableQuery.isLoading ? (
                <li className="px-4 py-3 text-sm text-neutral-500 text-center">
                  Đang tải danh sách học viên...
                </li>
              ) : suggestions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-neutral-500 text-center">
                  {search.trim()
                    ? "Không tìm thấy học viên phù hợp với từ khóa."
                    : "Không có học viên chưa xếp lớp trong Hệ này."}
                </li>
              ) : (
                suggestions.map((st) => (
                  <li key={st.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors flex items-baseline gap-2"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Ngăn blur trước khi click
                        handleSelect(st);
                      }}
                    >
                      <span className="font-medium text-sm text-neutral-900 dark:text-white">
                        {st.fullName}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono shrink-0">
                        {st.code}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Card học viên đã chọn + nút xếp */}
        {selected && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                {selected.fullName}
              </p>
              <p className="text-xs text-neutral-500 font-mono">{selected.code}</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              isLoading={assigningCode === selected.code}
              disabled={Boolean(assigningCode)}
              onClick={handleAssign}
            >
              Xếp vào lớp
            </Button>
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex-shrink-0"
              aria-label="Bỏ chọn"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Phần 2: Danh sách học viên hiện có trong lớp */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiOutlineUserGroup className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <Typography variant="body" weight="semibold">
              Danh sách học viên trong lớp
            </Typography>
          </div>
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800 dark:bg-primary-950 dark:text-primary-300">
            {students.length} học viên
          </span>
        </div>

        {studentsQuery.isLoading ? (
          <p className="text-sm text-neutral-500 py-4 text-center">Đang tải danh sách học viên trong lớp...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 text-center italic">Lớp này hiện chưa có học viên nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="py-2 px-3 font-semibold w-12 text-center">STT</th>
                  <th className="py-2 px-3 font-semibold">Mã học viên</th>
                  <th className="py-2 px-3 font-semibold">Họ và tên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {students.map((st, index) => (
                  <tr key={st.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="py-2.5 px-3 text-center text-neutral-500">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{st.code}</td>
                    <td className="py-2.5 px-3 font-medium">{st.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
