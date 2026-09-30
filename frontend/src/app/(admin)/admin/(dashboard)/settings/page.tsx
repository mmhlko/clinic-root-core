import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ClinicSettingsManager } from "@/widgets/clinic-settings/clinic-settings-manager";

export default async function SettingsPage() {
  const session = await requireUserSession();
  const canManageLocations =
    session.user.role === "root" || session.user.role === "admin";
  const [clinic, locations, features, socialLinks, statistics] =
    await Promise.all([
      contentServerApi.clinic(session.accessToken),
      canManageLocations
        ? contentServerApi.locations(session.accessToken)
        : contentServerApi.publicLocations(),
      contentServerApi.features(session.accessToken),
      contentServerApi.socialLinks(session.accessToken),
      contentServerApi.statistics(session.accessToken),
    ]);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Настройки клиники"
        description="Основные данные, филиалы и контентные настройки"
      />
      <ClinicSettingsManager
        clinic={clinic}
        locations={locations}
        features={features}
        socialLinks={socialLinks}
        statistics={statistics}
        canManageLocations={canManageLocations}
      />
    </div>
  );
}
