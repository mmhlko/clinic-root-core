import { dashboardApi } from "@/features/dashboard/api/dashboard-server-api";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { requireUserSession } from "@/features/auth/api/require-admin-session";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const session = await requireUserSession(
    `/${encodeURIComponent(clinicSlug)}/admin/login`,
  );

  const [dashboard, promotions] = await Promise.all([
    dashboardApi.get(session.accessToken),
    dashboardApi.getPromotions(session.accessToken),
  ]);

  return (
    <DashboardView
      clinicSlug={clinicSlug}
      overview={dashboard.overview}
      requests={dashboard.appointmentRequests}
      requestTrend={dashboard.requestTrend}
      pendingReviews={dashboard.moderation.pendingReviews}
      recentRequests={dashboard.recentRequests}
      promotions={promotions}
    />
  );
}
