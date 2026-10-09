import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LegacyAdminPath({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const clinicSlug = path.join("/") === "login"
    ? "demo"
    : (await cookies()).get("clinicSlug")?.value;
  const safeClinicSlug = clinicSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clinicSlug)
    ? clinicSlug
    : "demo";
  redirect(`/${encodeURIComponent(safeClinicSlug)}/admin/${path.map(encodeURIComponent).join("/")}`);
}
