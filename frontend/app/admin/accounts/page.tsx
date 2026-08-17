import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import Main from "@/components/admin/accounts/Main";
import { QUERY_KEYS } from "@/constants/query-keys";
import { DEFAULT_PAGE } from "@/constants/constants";
import apiServer from "@/services/axios-server";
import { ENDPOINTS } from "@/constants/endpoints";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý tài khoản (Admin) | Hệ thống quản lý học viên",
  description: "Quản lý tài khoản toàn hệ thống",
};

export default async function AdminAccountsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      QUERY_KEYS.USERS,
      { pageIndex: DEFAULT_PAGE.PAGE_INDEX, pageSize: DEFAULT_PAGE.PAGE_SIZE },
      [],
      [],
    ],
    queryFn: async () => await apiServer.get(ENDPOINTS.USERS.BASE, {
      params: {
        page: DEFAULT_PAGE.PAGE_INDEX + 1,
        limit: DEFAULT_PAGE.PAGE_SIZE,
      },
    }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Main />
    </HydrationBoundary>
  );
}
