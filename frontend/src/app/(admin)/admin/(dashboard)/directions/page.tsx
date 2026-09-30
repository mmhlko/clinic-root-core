import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ContentManager } from "@/widgets/admin-content/content-manager";

export default async function DirectionsPage() {
  const session = await requireUserSession();
  const directions = await contentServerApi.directions(session.accessToken);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Направления"
        description="Направления медицинских услуг"
      />
      <ContentManager kind="directions" initialData={directions} />
    </div>
  );
}
