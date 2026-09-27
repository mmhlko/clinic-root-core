import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { DoctorForm } from "@/features/doctors/components/doctor-form";
import { doctorsServerApi } from "@/features/doctors/api/doctors-server-api";

export default async function NewDoctorPage() {
  const session = await requireUserSession();
  const [directions, skills] = await Promise.all([
    doctorsServerApi.getDirections(session.accessToken),
    doctorsServerApi.getSkills(session.accessToken),
  ]);

  return (
    <DoctorForm
      mode="create"
      directions={directions.filter((direction) => direction.isActive)}
      skills={skills.filter((skill) => skill.isActive)}
    />
  );
}
