import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/shared/page-header";
import { doctorsServerApi } from "@/features/doctors/api/doctors-server-api";
import { DoctorsList } from "@/widgets/doctors/doctors-list";

export default async function DoctorsPage() {
  const session = await requireUserSession();
  const doctorList = await doctorsServerApi.getDoctorListAdmin(session.accessToken);


  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Список врачей"
        description="Управление врачами клиники"
      />
      <section>
        <DoctorsList doctors={doctorList} />
      </section>
    </div>
  );
}
