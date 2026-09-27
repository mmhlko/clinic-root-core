import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
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
        action={
          <Button
            nativeButton={false}
            render={<Link href="/admin/doctors/new" />}
            size="lg"
          >
            <PlusIcon data-icon="inline-start" />
            Добавить врача
          </Button>
        }
      />
      <section>
        <DoctorsList doctors={doctorList} />
      </section>
    </div>
  );
}
