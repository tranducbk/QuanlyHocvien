"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import PageContainer from "@/library/PageContainer";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { trainingProgramService } from "@/services/training-program/training-programs";

export default function Main() {
  const [trainingSystemId, setTrainingSystemId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [versionName, setVersionName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const systemsQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_SYSTEMS],
    queryFn: trainingProgramService.getSystems,
  });
  const programsQuery = useQuery({
    queryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    queryFn: trainingProgramService.getPrograms,
  });
  const systems = systemsQuery.data?.data ?? [];
  const programs = programsQuery.data?.data ?? [];

  const createProgram = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_TRAINING_PROGRAM,
    mutationFn: trainingProgramService.createProgram,
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã lưu chương trình đào tạo",
    onSuccess: () => {
      setCode("");
      setName("");
      setDescription("");
    },
  });
  const createVersion = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_CURRICULUM_VERSION,
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof trainingProgramService.createVersion>[1] }) =>
      trainingProgramService.createVersion(id, data),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_PROGRAMS],
    successMessage: "Đã lưu phiên bản chương trình",
    onSuccess: () => {
      setVersionCode("");
      setVersionName("");
      setEffectiveFrom("");
      setEffectiveTo("");
    },
  });

  const submitProgram = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProgram.mutate({ trainingSystemId, code: code.trim(), name: name.trim(), description: description.trim() });
  };
  const submitVersion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) return;
    createVersion.mutate({
      id: programId,
      data: {
        versionCode: versionCode.trim(),
        name: versionName.trim(),
        effectiveFrom: effectiveFrom || null,
        effectiveTo: effectiveTo || null,
      },
    });
  };

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan", href: "/admin" }, { label: "Chương trình đào tạo" }]}
      title="Chương trình đào tạo"
      subtitle="Nhập chương trình và phiên bản thực tế theo từng Hệ. Phiên bản mới được lưu ở trạng thái nháp."
      isError={systemsQuery.isError || programsQuery.isError}
      onRetry={() => { void systemsQuery.refetch(); void programsQuery.refetch(); }}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitProgram} className="space-y-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="text-lg font-bold">Thêm chương trình</h2>
          <Select label="Hệ đào tạo" required value={trainingSystemId} onChange={(value) => setTrainingSystemId(String(value))}
            options={systems.filter((system) => system.isActive).map((system) => ({ value: system.id, label: `${system.name} (${system.code})` }))} />
          <Input label="Mã chương trình" required maxLength={50} value={code} onChange={(event) => setCode(event.target.value)} />
          <Input label="Tên chương trình" required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Mô tả" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
          <Button type="submit" isLoading={createProgram.isPending} disabled={!trainingSystemId || !code.trim() || !name.trim()}>
            Lưu chương trình
          </Button>
        </form>
        <form onSubmit={submitVersion} className="space-y-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="text-lg font-bold">Thêm phiên bản</h2>
          <Select label="Chương trình" required value={programId} onChange={(value) => setProgramId(String(value))}
            options={programs.map((program) => ({ value: program.id, label: `${program.trainingSystem?.name ?? "Hệ"} · ${program.name} (${program.code})` }))} />
          <Input label="Mã phiên bản" required maxLength={50} value={versionCode} onChange={(event) => setVersionCode(event.target.value)} />
          <Input label="Tên phiên bản" required maxLength={255} value={versionName} onChange={(event) => setVersionName(event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="date" label="Hiệu lực từ" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} />
            <Input type="date" label="Hiệu lực đến" min={effectiveFrom || undefined} value={effectiveTo} onChange={(event) => setEffectiveTo(event.target.value)} />
          </div>
          {effectiveFrom && effectiveTo && effectiveTo < effectiveFrom && <p className="text-sm text-red-600">Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.</p>}
          <Button type="submit" isLoading={createVersion.isPending} disabled={!programId || !versionCode.trim() || !versionName.trim() || Boolean(effectiveFrom && effectiveTo && effectiveTo < effectiveFrom)}>
            Lưu phiên bản nháp
          </Button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Dữ liệu đã lưu ({programs.length})</h2>
        {programsQuery.isLoading ? <p>Đang tải...</p> : programs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">Chưa có chương trình đào tạo.</p>
        ) : programs.map((program) => (
          <article key={program.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="font-semibold">{program.trainingSystem?.name} · {program.name} <span className="text-sm font-normal text-neutral-500">({program.code})</span></div>
            {program.description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{program.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {program.versions.length === 0 ? <span className="text-sm text-neutral-500">Chưa có phiên bản</span> : program.versions.map((version) => (
                <span key={version.id} className="rounded-lg bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-900">
                  {version.name} ({version.versionCode}) · {version.status}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
