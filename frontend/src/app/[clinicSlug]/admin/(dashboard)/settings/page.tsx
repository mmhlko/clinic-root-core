import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  redirect(`/${encodeURIComponent(clinicSlug)}/admin/settings/general`);
}
