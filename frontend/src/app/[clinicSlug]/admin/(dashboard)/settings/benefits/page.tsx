import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { BenefitsSettings } from "@/widgets/clinic-settings/clinic-settings-collections";

export default async function BenefitsSettingsPage() {
  const session = await requireUserSession();
  const features = await contentServerApi.features(session.accessToken);

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title="Преимущества"
        description="Контентные преимущества клиники."
      />
      <BenefitsSettings features={features} />
    </div>
  );
}
