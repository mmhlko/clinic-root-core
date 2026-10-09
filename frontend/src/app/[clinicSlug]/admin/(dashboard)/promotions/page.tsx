import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { PromotionsList } from "@/widgets/admin-content/promotions-list";

export default async function PromotionsPage() {
  const session = await requireUserSession();
  const [promotions, services] = await Promise.all([
    contentServerApi.promotions(session.accessToken),
    contentServerApi.services(session.accessToken),
  ]);
  return (
    <div className="mx-auto w-full">
      <PageHeader title="Акции" description="Управление акциями клиники" />
      <PromotionsList initialItems={promotions} services={services} />
    </div>
  );
}
