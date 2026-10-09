import { redirect } from "next/navigation";

export default async function LegacyAdminPath({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  redirect(`/demo/admin/${path.join("/")}`);
}
