import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ClinicPlatformManager } from "@/widgets/platform/clinic-platform-manager";

export default async function PlatformClinicsPage() {
  const session = await requireUserSession();
  const clinics = await contentServerApi.platformClinics(session.accessToken);

  return (
    <div className="mx-auto w-full">
      <PageHeader title="Клиники" description="Управление сайтами и доступом клиентов" />
      <ClinicPlatformManager initialItems={clinics.filter((c) => c.slug !== 'demo')} />
    </div>
  );
}
