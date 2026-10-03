import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ClinicSettingsManager } from "@/widgets/clinic-settings/clinic-settings-manager";

export default async function GeneralSettingsPage() {
  const session = await requireUserSession();
  const clinic = await contentServerApi.clinic(session.accessToken);

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title="Общие настройки"
        description="Основные данные и контакты клиники."
      />
      <ClinicSettingsManager clinic={clinic} />
    </div>
  );
}
