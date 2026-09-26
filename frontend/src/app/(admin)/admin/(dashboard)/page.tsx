import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/features/auth/api/auth-server-api";
import { dashboardApi } from "@/features/dashboard/api/dashboard-server-api";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export default async function AdminHomePage() {
  const refreshToken = (await cookies()).get("refreshToken")?.value;

  if (!refreshToken) {
    redirect("/admin/login");
  }

  const session = await getAdminSession(refreshToken);
  const [dashboard, promotions] = await Promise.all([
    dashboardApi.get(session.accessToken),
    dashboardApi.getPromotions(session.accessToken),
  ]);

  return (
    <DashboardView
      overview={dashboard.overview}
      requests={dashboard.appointmentRequests}
      pendingReviews={dashboard.moderation.pendingReviews}
      recentRequests={dashboard.recentRequests}
      promotions={promotions}
    />
  );
}
