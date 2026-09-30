import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ContentManager } from "@/widgets/admin-content/content-manager";

export default async function DocumentsPage() {
  const session = await requireUserSession();
  const documents = await contentServerApi.documents(session.accessToken);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Документы"
        description="Документы и материалы для пациентов"
      />
      <ContentManager kind="documents" initialData={documents} />
    </div>
  );
}
