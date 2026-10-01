import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { DirectionsList } from "@/widgets/admin-content/directions-list";

export default async function DirectionsPage() {
  const session = await requireUserSession();
  const directions = await contentServerApi.directions(session.accessToken);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Направления"
        description="Направления медицинских услуг"
      />
      <DirectionsList initialItems={directions} />
    </div>
  );
}
