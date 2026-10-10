import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LegacyAdminPage() {
  const cookieSlug = (await cookies()).get("clinicSlug")?.value;
  const clinicSlug = cookieSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cookieSlug)
    ? cookieSlug
    : "demo";
  redirect(`/${encodeURIComponent(clinicSlug)}/admin`);
}
