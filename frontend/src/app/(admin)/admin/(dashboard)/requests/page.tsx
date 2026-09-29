import { PageHeader } from "@/components/admin/page-header";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { appointmentRequestsServerApi } from "@/features/appointment-requests/api/appointment-requests-server-api";
import { RequestsList } from "@/widgets/appointment-requests/requests-list";

export default async function RequestsPage() {
  const session = await requireUserSession();
  const requests = await appointmentRequestsServerApi.getAll(session.accessToken);

  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Заявки"
        description="Обращения пациентов и управление ими"
      />

      <RequestsList requests={requests} />
    </div>
  );
}
