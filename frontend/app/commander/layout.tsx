import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import Sidebar from "@/components/commander/layout/Sidebar";
import Header from "@/components/commander/layout/header/Header";
import { QUERY_KEYS } from "@/constants/query-keys";
import apiServer from "@/services/axios-server";
import { ENDPOINTS } from "@/constants/endpoints";

export default async function CommanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: async () => await apiServer.get(ENDPOINTS.AUTH.PROFILE),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        {/* Vùng nội dung chính */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header trên cùng */}
          <Header />

          {/* Nội dung trang */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
    </HydrationBoundary>
  );
}
