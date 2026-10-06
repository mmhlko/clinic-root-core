"use client";

import { useState } from "react";

import type { DoctorListItem } from "@/features/doctors/types/doctors.types";
import { doctorsClientApi } from "@/features/doctors/api/doctors-client-api";

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { getDoctorFullName } from "@/shared/helpers/getDoctorFullName";
import { ListStats } from "@/components/shared/list-stats";
import { ActiveSwitch } from "@/components/shared/active-switch";
import { PersonIdentity } from "@/components/shared/person-identity";
import { toast } from "@/components/ui/toast";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { useReorder } from "@/shared/hooks/use-reorder";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { ContentActionsMenu } from "../admin-content/content-actions-menu";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { activityColorsStyles } from "@/shared/constants/colors";
import { ContentList } from "../admin-content/content-list";

interface DoctorsListProps {
  doctors: DoctorListItem[];
}

export function DoctorsList({ doctors: initialDoctors }: DoctorsListProps) {
  const router = useRouter();
  const [doctors, setDoctors] = useState(initialDoctors);
  const [busyId, setBusyId] = useState<string | null>(null);
  const total = doctors.length;
  const active = doctors.filter((doctor) => doctor.isActive).length;
  const inactive = total - active;

  const handleSwitch = async (id: string, isActive: boolean) => {
    const previous = doctors.find((doctor) => doctor.id === id)?.isActive;
    setBusyId(id);
    setDoctors((current) =>
      current.map((doctor) =>
        doctor.id === id ? { ...doctor, isActive } : doctor,
      ),
    );
    try {
      const data = await doctorsClientApi.updateDoctorStatus(id, isActive);
      setDoctors((current) =>
        current.map((doctor) =>
          doctor.id === id ? { ...doctor, isActive: data.isActive } : doctor,
        ),
      );
    } catch {
      setDoctors((current) =>
        current.map((doctor) =>
          doctor.id === id && previous !== undefined
            ? { ...doctor, isActive: previous }
            : doctor,
        ),
      );
      toast.add({
        type: "error",
        description: "Не удалось изменить статус врача.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await doctorsClientApi.deleteDoctor(id);
      setDoctors((current) => current.filter((doctor) => doctor.id !== id));
    } catch {
      toast.add({
        type: "error",
        description: "Не удалось удалить врача.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const doctorIdentity = (doctor: DoctorListItem) => (
    <PersonIdentity
      name={getDoctorFullName(doctor)}
      subtitle={doctor.specialization}
      avatarUrl={getImageUrl(doctor.photoMedia?.url)}
      initials={`${doctor.firstName?.[0] ?? "В"}${doctor.lastName?.[0] ?? ""}`}
    />
  );

  function statusSwitch(doctor: DoctorListItem) {
    return (
      <ActiveSwitch
        checked={doctor.isActive}
        disabled={busyId === doctor.id}
        onChange={(isActive) => handleSwitch(doctor.id, isActive)}
        label={doctor.isActive ? "Активен" : "Неактивен"}
      />
    );
  }

  function doctorMenu(doctor: DoctorListItem) {
    return (
      <ContentActionsMenu
        item={doctor}
        itemLabel={getDoctorFullName(doctor)}
        actions={[
          {
            label: "Редактировать",
            onSelect: (doctor) =>
              router.push(`/admin/doctors/${doctor.id}/edit`),
          },
          {
            label: "Удалить",
            destructive: true,
            onSelect: () => handleDelete(doctor.id),
            disabled: busyId === doctor.id,
            confirm: {
              title: "Удалить врача?",
              description: "Врач будет удалён из административной панели.",
            },
          },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ListStats total={total} active={active} inactive={inactive} />
      <ContentList
        title="Врачишки"
        items={doctors}
        setItems={setDoctors}
        getId={(doctor) => doctor.id}
        getSearchText={(doctor) =>
          `${doctor.firstName} ${doctor.lastName} ${doctor.specialization}`
        }
        onAdd={() => router.push("/admin/doctors/new")}
        columnCount={3}
        emptyMessage="Врачей пока нет. Добавьте нового врача, чтобы он появился в списке."
        reorder={(ids) => doctorsClientApi.reorderDoctors(ids)}
        onReorderError={() => {
          toast.add({
            type: "error",
            description: "Не удалось сохранить порядок врачей.",
          });
        }}
        renderHeader={() => (
          <TableRow>
            <TableHead className="w-10 px-2">
              <span className="sr-only">Перемещение</span>
            </TableHead>
            <TableHead>Специалист</TableHead>
            <TableHead>Статус активности</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Действия</span>
            </TableHead>
          </TableRow>
        )}
        renderCells={(doctor, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell>{doctorIdentity(doctor)}</TableCell>
            <TableCell>{statusSwitch(doctor)}</TableCell>
            <TableCell className="text-right">{doctorMenu(doctor)}</TableCell>
          </>
        )}
        renderCard={(doctor, dragHandle) => (
          <SortableCard
            item={doctor}
            dragHandle={dragHandle}
            onSwitch={(checked) => handleSwitch(doctor.id, checked)}
            status={
              <Badge
                className={
                  activityColorsStyles[doctor.isActive ? "active" : "inactive"]
                }
              >
                {doctor.isActive ? "Активен" : "Скрыт"}
              </Badge>
            }
            actionsMenu={doctorMenu(doctor)}
          >
            <PersonIdentity
              name={getDoctorFullName(doctor)}
              subtitle={doctor.specialization}
              avatarUrl={getImageUrl(doctor.photoMedia?.url)}
              initials={`${doctor.firstName?.[0] ?? "В"}${doctor.lastName?.[0] ?? ""}`}
            />
          </SortableCard>
        )}
      />
    </div>
  );
}
