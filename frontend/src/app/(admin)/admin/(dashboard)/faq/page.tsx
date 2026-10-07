import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { FaqList } from "@/widgets/admin-content/faq-list";

export default async function FaqPage() {
  const session = await requireUserSession();
  const faq = await contentServerApi.faq(session.accessToken);
  return (
    <div className="mx-auto w-full">
      <PageHeader title="FAQ" description="Вопросы и ответы для сайта" />
      <FaqList initialItems={faq} />
    </div>
  );
}
