"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryClassService } from "@/services/military-classes";
import { useConfirmStore } from "@/store/useConfirmStore";
import { MilitaryClass } from "@/types/military-classes";

export default function AdminMilitaryClassesPage() {
  const client = useQueryClient();
  const { openConfirm } = useConfirmStore();
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [commanderId, setCommanderId] = useState("");
  const [editingId, setEditingId] = useState("");
  const classes = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES],
    queryFn: militaryClassService.getAll,
  });
  const commanders = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_CLASSES, "commanders"],
    queryFn: militaryClassService.getMilitaryCommanders,
  });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: [QUERY_KEYS.MILITARY_CLASSES] });
  };
  const create = useMutation({
    mutationFn: militaryClassService.create,
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: () =>
      militaryClassService.update(editingId, {
        className: className.trim(),
        classCode: classCode.trim(),
        commanderId,
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: militaryClassService.delete,
    onSuccess: refresh,
  });
  const reset = () => {
    setEditingId("");
    setClassName("");
    setClassCode("");
    setCommanderId("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      className: className.trim(),
      classCode: classCode.trim(),
      commanderId,
    };
    if (editingId) update.mutate();
    else create.mutate(data);
    reset();
  };
  const edit = (item: MilitaryClass) => {
    setEditingId(item.id);
    setClassName(item.className);
    setClassCode(item.classCode);
    setCommanderId(item.commanderId);
  };

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/admin" },
        { label: "Lớp quân sự" },
      ]}
      title="Quản lý lớp quân sự"
      subtitle="Admin tạo lớp và phân công Chỉ huy phụ trách."
    >
      <form
        onSubmit={submit}
        className="mb-6 grid gap-3 rounded-xl border border-neutral-200 p-4 md:grid-cols-4"
      >
        <label className="grid gap-1 text-sm">
          Tên lớp
          <input
            required
            maxLength={255}
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Mã lớp
          <input
            required
            maxLength={50}
            value={classCode}
            onChange={(event) => setClassCode(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Chỉ huy phụ trách
          <select
            required
            value={commanderId}
            onChange={(event) => setCommanderId(event.target.value)}
            className="rounded-lg border px-3 py-2 dark:bg-neutral-900"
          >
            <option value="">Chọn Chỉ huy</option>
            {(commanders.data?.data || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.username}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            disabled={create.isPending || update.isPending}
            className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {editingId ? "Lưu thay đổi" : "Tạo lớp"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border px-4 py-2"
            >
              Hủy
            </button>
          )}
        </div>
        {(create.isError || update.isError) && (
          <p role="alert" className="text-sm text-red-600 md:col-span-4">
            Không thể lưu lớp. Kiểm tra mã lớp và Chỉ huy phụ trách.
          </p>
        )}
      </form>
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3">Mã lớp</th>
              <th className="p-3">Tên lớp</th>
              <th className="p-3">Chỉ huy</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.data?.data?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.classCode}</td>
                <td className="p-3">{item.className}</td>
                <td className="p-3">
                  {item.commander?.username || item.commanderId}
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => edit(item)}
                      className="text-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openConfirm({
                          title: "Xác nhận xóa lớp",
                          message: `Xóa lớp ${item.className}? Chỉ lớp chưa có học viên hoặc dữ liệu đào tạo mới xóa được.`,
                          confirmText: "Xóa lớp",
                          variant: "danger",
                          onConfirm: () => remove.mutate(item.id),
                        })
                      }
                      className="text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!classes.data?.data?.length && (
              <tr>
                <td colSpan={4} className="p-5 text-center text-neutral-500">
                  Chưa có lớp quân sự.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {remove.isError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          Không thể xóa lớp đã có học viên hoặc dữ liệu đào tạo.
        </p>
      )}
    </PageContainer>
  );
}
