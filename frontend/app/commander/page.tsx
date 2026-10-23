import Main from "@/components/commander/dashboard/Main";
import { cookies } from "next/headers";

export default async function CommanderDashboardPage() {
  const trainingSystemCode = (await cookies()).get("trainingSystemCode")?.value;
  if (trainingSystemCode && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(trainingSystemCode)) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Phân hệ quân sự đang hoàn thiện</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Dữ liệu Hệ 1, 3, 4 và 7 đang được tách theo từng hệ. Các chức năng quản lý lớp và kết quả học tập sẽ mở lại sau khi hoàn tất bước này.
        </p>
      </main>
    );
  }
  return <Main />;
}
