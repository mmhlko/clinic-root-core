"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

import { MoreHorizontalIcon } from "lucide-react";

import type { DoctorListItem } from "@/features/doctors/types/doctors.types";
import { doctorsClientApi } from "@/features/doctors/api/doctors-client-api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { getDoctorFullName } from "@/shared/helpers/getDoctorFullName";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListStats } from "@/components/shared/list-stats";
import { ActiveSwitch } from "@/components/shared/active-switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { useReorder } from "@/shared/hooks/use-reorder";
import { SortableTableList } from "@/components/shared/sortable-list/sortable-table-list";
import { SortableCardList } from "@/components/shared/sortable-list/sortable-card-list";
import { MobileDoctorCard } from "./mobile-doctor-card";

interface DoctorsListProps {
  doctors: DoctorListItem[];
}

interface SortableDoctorRowProps {
  doctor: DoctorListItem;
  onSwitch: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
  dragHandle: ReactNode;
}

function DoctorMenu({
  doctor,
  onDelete,
  deleting,
}: {
  doctor: DoctorListItem;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={deleting}
          />
        }
      >
        <MoreHorizontalIcon />
        <span className="sr-only">Открыть меню</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          nativeButton={false}
          render={<Link href={`/admin/doctors/${doctor.id}/edit`} />}
        >
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmDialog
          trigger={
            <DropdownMenuItem variant="destructive">Удалить</DropdownMenuItem>
          }
          title="Удалить врача?"
          description="Врач будет удалён из административной панели. Это действие нельзя отменить."
          confirmText="Удалить"
          confirmButtonVariant="destructive"
          nativeButton={false}
          disabled={deleting}
          onConfirm={() => onDelete(doctor.id)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DoctorIdentity({ doctor }: { doctor: DoctorListItem }) {
  const avatarUrl = getImageUrl(doctor.photoMedia?.url);
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 shrink-0 rounded-full">
        <AvatarImage src={avatarUrl} alt={getDoctorFullName(doctor)} />
        <AvatarFallback>
          {doctor.firstName?.[0] ?? "В"}
          {doctor.lastName?.[0] ?? ""}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">{getDoctorFullName(doctor)}</div>
        <div className="truncate text-xs text-muted-foreground">
          {doctor.specialization}
        </div>
      </div>
    </div>
  );
}

export function DoctorsList({ doctors: initialDoctors }: DoctorsListProps) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = doctors.length;
  const active = doctors.filter((doctor) => doctor.isActive).length;
  const inactive = total - active;

  const { sensors, handleDragEnd } = useReorder({
    items: doctors,
    getId: (doctor) => doctor.id,
    setItems: setDoctors,
    onReorder: (ids) => doctorsClientApi.reorderDoctors(ids),
    onError: () => {
      setError("Не удалось сохранить порядок врачей.");
    },
  });

  const handleSwitch = async (id: string, isActive: boolean) => {
    const previous = doctors.find((doctor) => doctor.id === id)?.isActive;
    setError(null);
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
      setError("Не удалось изменить статус врача.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setBusyId(id);
    try {
      await doctorsClientApi.deleteDoctor(id);
      setDoctors((current) => current.filter((doctor) => doctor.id !== id));
    } catch {
      setError("Не удалось удалить врача.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <ListStats total={total} active={active} inactive={inactive} />
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="md:hidden space-y-3">
        {doctors.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Врачей пока нет.
          </div>
        ) : (
          <SortableCardList
            items={doctors}
            getId={(doctor) => doctor.id}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            dndId="doctors-mobile-dnd"
            emptyMessage="Врачей пока нет."
            renderCard={(doctor, dragHandle) => (
              <MobileDoctorCard
                key={doctor.id}
                doctor={doctor}
                onSwitch={handleSwitch}
                onDelete={handleDelete}
                deleting={busyId === doctor.id}
                dragHandle={dragHandle}
                menu={
                  <DoctorMenu
                    doctor={doctor}
                    onDelete={handleDelete}
                    deleting={busyId === doctor.id}
                  />
                }
              />
            )}
          />
        )}
      </div>

      <div className="hidden md:block overflow-hidden rounded-lg border bg-card">
        <SortableTableList
          items={doctors}
          getId={(doctor) => doctor.id}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          dndId="doctors-dnd"
          columnCount={4}
          emptyMessage="Врачей пока нет."
          renderHeader={() => (
            <TableRow>
              <TableHead className="w-10 px-2">
                <span className="sr-only">Перемещение</span>
              </TableHead>

              <TableHead>Врач</TableHead>

              <TableHead>Статус</TableHead>

              <TableHead className="w-10 text-right" />
            </TableRow>
          )}
          renderCells={(doctor, dragHandle) => (
            <>
              <TableCell className="w-10 px-2">{dragHandle}</TableCell>

              <TableCell>
                <DoctorIdentity doctor={doctor} />
              </TableCell>

              <TableCell>
                <ActiveSwitch
                  checked={doctor.isActive}
                  onChange={(checked) => handleSwitch(doctor.id, checked)}
                  label={doctor.isActive ? "Активен" : "Скрыт"}
                />
              </TableCell>

              <TableCell className="w-10 text-right">
                <DoctorMenu
                  doctor={doctor}
                  onDelete={handleDelete}
                  deleting={busyId === doctor.id}
                />
              </TableCell>
            </>
          )}
        />
      </div>
    </div>
  );
}
