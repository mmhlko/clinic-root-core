import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import { ClinicHome } from "../(public)/page";

export const dynamic = "force-dynamic";

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;

  try {
    return await ClinicHome({ clinicSlug });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}
