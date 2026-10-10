import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { BranchesSettings } from "@/widgets/clinic-settings/clinic-settings-collections";

export default async function BranchSettingsPage() {
  const session = await requireUserSession();
  const canManage =
    session.user.role === "root" || session.user.role === "admin";
  const locations = canManage
    ? await contentServerApi.locations(session.accessToken)
    : await contentServerApi.publicLocations();

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title="Филиалы"
        description="Адреса и контактная информация филиалов."
      />
      <BranchesSettings locations={locations} canManage={canManage} />
    </div>
  );
}
