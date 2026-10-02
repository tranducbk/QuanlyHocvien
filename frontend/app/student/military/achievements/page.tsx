"use client";

import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import { QUERY_KEYS } from "@/constants/query-keys";
import { militaryAcademicService } from "@/services/military-academic";

export default function StudentMilitaryAchievementsPage() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.MILITARY_ACHIEVEMENTS, "me"],
    queryFn: militaryAcademicService.getMyAchievements,
  });
  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/student" },
        { label: "Thành tích" },
      ]}
      title="Thành tích"
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => void query.refetch()}
    >
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3">Năm</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Thành tích</th>
              <th className="p-3">Danh hiệu</th>
              <th className="p-3">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.data?.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.year || "—"}</td>
                <td className="p-3">
                  {row.category === "AWARD"
                    ? "Khen thưởng"
                    : row.category === "SCIENTIFIC_TOPIC"
                      ? "Đề tài khoa học"
                      : "Sáng kiến khoa học"}
                </td>
                <td className="p-3">{row.title}</td>
                <td className="p-3">{row.award || "—"}</td>
                <td className="p-3">{row.description || "—"}</td>
              </tr>
            ))}
            {!query.data?.data?.length && (
              <tr>
                <td colSpan={5} className="p-5 text-center text-neutral-500">
                  Chưa có thành tích.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
