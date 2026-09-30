import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { doctorsServerApi } from "@/features/doctors/api/doctors-server-api";
import { ContentManager } from "@/widgets/admin-content/content-manager";

export default async function ReviewsPage() {
  const session = await requireUserSession();
  const [reviews, doctors] = await Promise.all([
    contentServerApi.reviews(session.accessToken),
    doctorsServerApi.getDoctorListAdmin(session.accessToken),
  ]);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Отзывы"
        description="Модерация и управление отзывами"
      />
      <ContentManager
        kind="reviews"
        initialData={reviews}
        references={{ doctors }}
      />
    </div>
  );
}
