import { PageHeader } from "@/components/shared/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { SocialsSettings } from "@/widgets/clinic-settings/clinic-settings-collections";

export default async function SocialSettingsPage() {
  const session = await requireUserSession();
  const socialLinks = await contentServerApi.socialLinks(session.accessToken);

  return (
    <div className="mx-auto w-full space-y-6">
      <PageHeader
        title="Социальные сети"
        description="Ссылки на социальные сети клиники."
      />
      <SocialsSettings socialLinks={socialLinks} />
    </div>
  );
}
