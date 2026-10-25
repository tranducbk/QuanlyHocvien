"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiPlus, HiOutlineUpload, HiOutlineDownload } from "react-icons/hi";
import { useToastStore } from "@/store/useToastStore";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import { SubjectResult } from "@/types/academic-results/student-academic";
import { academicManagementService } from "@/services/academic-results/academic-management";
import { formatScore, textOrDash } from "@/utils/fn-common";
import { useModalStore } from "@/store/useModalStore";
import SubjectResultForm from "../forms/SubjectResultForm";

interface SemesterDetailMainProps {
  semesterResultId: string;
}

export default function Main({
  semesterResultId,
}: SemesterDetailMainProps) {
  const { openModal, closeModal } = useModalStore();
  const { addToast } = useToastStore();

  const { data: detailData, isLoading, isError, refetch } = useQuery({
    queryKey: ["semesterResultDetail", semesterResultId],
    queryFn: () => academicManagementService.getSemesterResultDetail(semesterResultId),
    select: (res) => res.data,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await academicManagementService.downloadSubjectResultTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Mau_nhap_diem_mon_hoc.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast({ variant: "error", message: "Tải file mẫu thất bại" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await academicManagementService.importSubjectResults(semesterResultId, file);
      addToast({ variant: "success", message: res.message || "Nhập điểm thành công" });
      refetch();
    } catch (error: unknown) {
      addToast({ variant: "error", message: error instanceof Error ? error.message : "Lỗi khi nhập điểm" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenForm = () => {
    openModal({
      title: "Thêm điểm môn học",
      content: (
        <SubjectResultForm
          semesterResultId={semesterResultId}
          onSuccess={() => {
            refetch();
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  const columns = useMemo<ColumnDef<SubjectResult>[]>(
    () => [
      {
        id: "subjectCode",
        header: "Mã môn",
        accessorKey: "subjectCode",
        cell: (info) => <Typography variant="body">{textOrDash(info.row.original.subjectCode)}</Typography>,
      },
      {
        id: "subjectName",
        header: "Tên môn",
        accessorKey: "subjectName",
        cell: (info) => <Typography variant="body" weight="medium">{textOrDash(info.row.original.subjectName)}</Typography>,
      },
      {
        id: "credits",
        header: "TC",
        accessorKey: "credits",
        cell: (info) => <Typography variant="body">{info.row.original.credits}</Typography>,
      },
      {
        id: "gradePoint10",
        header: "Hệ 10",
        accessorKey: "gradePoint10",
        cell: (info) => <Typography variant="body">{formatScore(info.row.original.gradePoint10)}</Typography>,
      },
      {
        id: "gradePoint4",
        header: "Hệ 4",
        accessorKey: "gradePoint4",
        cell: (info) => <Typography variant="body">{formatScore(info.row.original.gradePoint4)}</Typography>,
      },
      {
        id: "letterGrade",
        header: "Điểm chữ",
        accessorKey: "letterGrade",
        cell: (info) => (
          <Typography variant="body" weight="bold">
            {textOrDash(info.row.original.letterGrade)}
          </Typography>
        ),
      },
    ],
    []
  );

  const pageTitle = detailData ? `Chi tiết điểm học kỳ: ${detailData.semester} - ${detailData.schoolYear}` : "Chi tiết điểm học kỳ";

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập", href: "/commander/academic-results" },
        { label: "Chi tiết điểm" },
      ]}
      title={pageTitle}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors p-4 md:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Typography variant="body" weight="semibold" className="text-neutral-600 dark:text-neutral-400 text-lg">
              Học viên: {detailData?.user?.profile?.fullName} ({detailData?.user?.profile?.code})
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadTemplate} icon={HiOutlineDownload} variant="outline" isLoading={isDownloading}>
              Tải file mẫu
            </Button>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              icon={HiOutlineUpload} 
              variant="outline"
              isLoading={isUploading}
            >
              Nhập từ Excel
            </Button>
            <Button onClick={handleOpenForm} icon={HiPlus}>
              Thêm môn học
            </Button>
          </div>
        </div>

        <Table
          data={{
            statusCode: 200,
            message: "Success",
            data: detailData?.subjectResults || [],
            pagination: { total: detailData?.subjectResults?.length || 0, page: 1, limit: 100, totalPages: 1 },
          }}
          pagination={{ pageIndex: 0, pageSize: 100 }}
          onPaginationChange={() => {}}
          columns={columns}
          emptyText="Chưa có môn học nào trong học kỳ này"
        />
      </div>
    </PageContainer>
  );
}
