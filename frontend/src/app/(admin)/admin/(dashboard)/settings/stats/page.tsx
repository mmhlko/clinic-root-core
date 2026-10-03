import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { StatisticsSettings } from "@/widgets/clinic-settings/clinic-settings-collections";

export default async function StatisticsSettingsPage() {
  const session = await requireUserSession();
  const statistics = await contentServerApi.statistics(session.accessToken);

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title="Статистика"
        description="Показатели клиники, отображаемые на сайте."
      />
      <StatisticsSettings statistics={statistics} />
    </div>
  );
}
