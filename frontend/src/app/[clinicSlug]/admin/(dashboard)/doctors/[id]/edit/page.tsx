import { isAxiosError } from "axios";
import { notFound } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { DoctorForm } from "@/features/doctors/components/doctor-form";
import { doctorsServerApi } from "@/features/doctors/api/doctors-server-api";

export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, requireUserSession()]);

  let doctor;
  let directions;
  let skills;

  try {
    [doctor, directions, skills] = await Promise.all([
      doctorsServerApi.getDoctorAdmin(id, session.accessToken),
      doctorsServerApi.getDirections(session.accessToken),
      doctorsServerApi.getSkills(session.accessToken),
    ]);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <DoctorForm
      mode="edit"
      doctor={doctor}
      directions={directions.filter((direction) => direction.isActive)}
      skills={skills.filter((skill) => skill.isActive)}
    />
  );
}
