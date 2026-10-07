import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ServicesList } from "@/widgets/admin-content/services-list";

export default async function ServicesPage() {
  const session = await requireUserSession();
  const [services, directions] = await Promise.all([
    contentServerApi.services(session.accessToken),
    contentServerApi.directions(session.accessToken),
  ]);
  return (
    <div className="mx-auto w-full">
      <PageHeader title="Услуги" description="Управление услугами клиники" />
      <ServicesList
        initialItems={services}
        directions={directions}
      />
    </div>
  );
}
