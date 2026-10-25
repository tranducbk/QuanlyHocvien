"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import PageContainer from "@/library/PageContainer";
import useAppMutation from "@/hooks/useAppMutation";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { trainingClassService } from "@/services/training-program/training-classes";
import { trainingProgramService } from "@/services/training-program/training-programs";

export default function Main() {
  const [trainingSystemId, setTrainingSystemId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [commanderId, setCommanderId] = useState("");
  const [educationProviderId, setEducationProviderId] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [curriculumVersionId, setCurriculumVersionId] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const systemsQuery = useQuery({ queryKey: [QUERY_KEYS.TRAINING_SYSTEMS], queryFn: trainingProgramService.getSystems });
  const programsQuery = useQuery({ queryKey: [QUERY_KEYS.TRAINING_PROGRAMS], queryFn: trainingProgramService.getPrograms });
  const optionsQuery = useQuery({ queryKey: [QUERY_KEYS.TRAINING_CLASS_OPTIONS], queryFn: trainingClassService.getOptions });
  const classesQuery = useQuery({ queryKey: [QUERY_KEYS.TRAINING_CLASSES], queryFn: trainingClassService.getClasses });

  const systems = systemsQuery.data?.data ?? [];
  const programs = programsQuery.data?.data ?? [];
  const options = optionsQuery.data?.data;
  const classes = classesQuery.data?.data ?? [];
  const selectedSystem = systems.find((system) => system.id === trainingSystemId);
  const isHe5 = selectedSystem?.code === "HE_5";
  const systemPrograms = programs.filter((program) => program.trainingSystemId === trainingSystemId && program.isActive);
  const selectedProgram = systemPrograms.find((program) => program.id === trainingProgramId);
  const commanders = (options?.commanders ?? []).filter((user) => user.trainingSystemId === trainingSystemId);
  const yearOrderInvalid = Boolean(startYear && endYear && Number(endYear) < Number(startYear));

  const createClass = useAppMutation({
    mutationKey: MUTATION_KEYS.CREATE_TRAINING_CLASS,
    mutationFn: trainingClassService.createClass,
    invalidateQueryKey: [QUERY_KEYS.TRAINING_CLASSES],
    successMessage: "Đã tạo lớp đào tạo",
    onSuccess: () => {
      setCode(""); setName(""); setCommanderId(""); setEducationProviderId("");
      setTrainingProgramId(""); setCurriculumVersionId(""); setStartYear(""); setEndYear("");
    },
  });
  const assignCommander = useAppMutation({
    mutationKey: MUTATION_KEYS.ASSIGN_TRAINING_CLASS_COMMANDER,
    mutationFn: ({ id, userId }: { id: string; userId: string | null }) => trainingClassService.assignCommander(id, userId),
    invalidateQueryKey: [QUERY_KEYS.TRAINING_CLASSES],
    successMessage: "Đã cập nhật Chỉ huy",
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trainingSystemId || yearOrderInvalid) return;
    createClass.mutate({
      trainingSystemId,
      code: code.trim(),
      name: name.trim(),
      commanderId: commanderId || null,
      educationProviderId: educationProviderId || null,
      trainingProgramId: trainingProgramId || null,
      curriculumVersionId: curriculumVersionId || null,
      startYear: startYear ? Number(startYear) : null,
      endYear: endYear ? Number(endYear) : null,
    });
  };

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan", href: "/admin" }, { label: "Lớp đào tạo" }]}
      title="Lớp đào tạo"
      subtitle="Tạo lớp thật theo từng Hệ và phân công Chỉ huy cùng Hệ. Chưa xếp học viên vào lớp ở bước này."
      isError={systemsQuery.isError || programsQuery.isError || optionsQuery.isError || classesQuery.isError}
      onRetry={() => { void systemsQuery.refetch(); void programsQuery.refetch(); void optionsQuery.refetch(); void classesQuery.refetch(); }}
    >
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-lg font-bold">Tạo lớp</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Hệ đào tạo" required value={trainingSystemId} onChange={(value) => {
            setTrainingSystemId(String(value)); setCommanderId(""); setEducationProviderId("");
            setTrainingProgramId(""); setCurriculumVersionId("");
          }} options={systems.filter((system) => system.isActive).map((system) => ({ value: system.id, label: system.name }))} />
          <Select label="Chỉ huy phụ trách" value={commanderId} onChange={(value) => setCommanderId(String(value))}
            options={[{ value: "", label: "Chưa phân công" }, ...commanders.map((user) => ({ value: user.id, label: user.name }))]} />
          <Input label="Mã lớp" required maxLength={50} value={code} onChange={(event) => setCode(event.target.value)} />
          <Input label="Tên lớp" required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} />
          {isHe5 && <Select label="Cơ sở đào tạo" required value={educationProviderId} onChange={(value) => setEducationProviderId(String(value))}
            options={(options?.providers ?? []).map((provider) => ({ value: provider.id, label: provider.name }))} />}
          <Select label="Chương trình đào tạo" required={!isHe5} value={trainingProgramId} onChange={(value) => {
            setTrainingProgramId(String(value)); setCurriculumVersionId("");
          }} options={isHe5 ? [{ value: "", label: "Chưa gắn chương trình" }, ...systemPrograms.map((program) => ({ value: program.id, label: program.name }))] : systemPrograms.map((program) => ({ value: program.id, label: program.name }))} />
          <Select label="Phiên bản chương trình" required={!isHe5 || Boolean(trainingProgramId)} value={curriculumVersionId}
            onChange={(value) => setCurriculumVersionId(String(value))} disabled={!trainingProgramId}
            options={(selectedProgram?.versions ?? []).map((version) => ({ value: version.id, label: `${version.name} (${version.versionCode})` }))} />
          <Input type="number" label="Năm bắt đầu" min={1900} max={2200} value={startYear} onChange={(event) => setStartYear(event.target.value)} />
          <Input type="number" label="Năm kết thúc" min={1900} max={2200} value={endYear} onChange={(event) => setEndYear(event.target.value)} />
        </div>
        {yearOrderInvalid && <p className="text-sm text-red-600">Năm kết thúc phải sau hoặc bằng năm bắt đầu.</p>}
        <Button type="submit" isLoading={createClass.isPending} disabled={!trainingSystemId || !code.trim() || !name.trim() || yearOrderInvalid || (isHe5 ? !educationProviderId : !trainingProgramId || !curriculumVersionId) || Boolean(trainingProgramId && !curriculumVersionId)}>
          Lưu lớp
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Lớp đã lưu ({classes.length})</h2>
        {classesQuery.isLoading ? <p>Đang tải...</p> : classes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">Chưa có lớp đào tạo mới.</p>
        ) : classes.map((item) => (
          <article key={item.id} className="grid gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-[1fr_280px]">
            <div>
              <div className="font-semibold">{item.trainingSystemName} · {item.name} ({item.code})</div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {[item.educationProviderName, item.trainingProgramName, item.curriculumVersionName].filter(Boolean).join(" · ") || "Chưa gắn chương trình"}
                {item.startYear && ` · ${item.startYear}${item.endYear ? `–${item.endYear}` : ""}`}
              </p>
            </div>
            <Select label="Chỉ huy phụ trách" value={item.commanderId ?? ""} disabled={assignCommander.isPending}
              onChange={(value) => assignCommander.mutate({ id: item.id, userId: String(value) || null })}
              options={[{ value: "", label: "Chưa phân công" }, ...(options?.commanders ?? [])
                .filter((user) => user.trainingSystemId === item.trainingSystemId)
                .map((user) => ({ value: user.id, label: user.name })),
                ...(item.commanderId && !(options?.commanders ?? []).some((user) => user.id === item.commanderId)
                  ? [{ value: item.commanderId, label: `${item.commanderName ?? "Chỉ huy"} (không còn hoạt động)` }] : [])]} />
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
