"use client";

import Link from "next/link";
import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontalIcon, GripVerticalIcon } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDoctorFullName } from "@/shared/helpers/getDoctorFullName";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListStats } from "@/components/shared/list-stats";
import { ActiveSwitch } from "@/components/shared/active-switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/shared/helpers/getImageUrl";

interface DoctorsListProps {
  doctors: DoctorListItem[];
}

interface SortableDoctorRowProps {
  doctor: DoctorListItem;
  onSwitch: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
    >
      <GripVerticalIcon className="size-4" />
      <span className="sr-only">Переместить врача</span>
    </Button>
  );
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

function SortableDoctorRow({
  doctor,
  onSwitch,
  onDelete,
  deleting,
}: SortableDoctorRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: doctor.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <TableCell className="w-10 px-2">
        <DragHandle id={doctor.id} />
      </TableCell>
      <TableCell>
        <DoctorIdentity doctor={doctor} />
      </TableCell>
      <TableCell>
        <ActiveSwitch
          checked={doctor.isActive}
          onChange={(checked) => onSwitch(doctor.id, checked)}
          label={doctor.isActive ? "Активен" : "Скрыт"}
        />
      </TableCell>
      <TableCell className="w-10 text-right">
        <DoctorMenu doctor={doctor} onDelete={onDelete} deleting={deleting} />
      </TableCell>
    </TableRow>
  );
}

function MobileDoctorCard({
  doctor,
  onSwitch,
  onDelete,
  deleting,
}: SortableDoctorRowProps) {
  return (
    <article className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <DoctorIdentity doctor={doctor} />
        <DoctorMenu doctor={doctor} onDelete={onDelete} deleting={deleting} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <Badge variant={doctor.isActive ? "default" : "outline"}>
          {doctor.isActive ? "Активен" : "Скрыт"}
        </Badge>
        <ActiveSwitch
          checked={doctor.isActive}
          onChange={(checked) => onSwitch(doctor.id, checked)}
          label=""
        />
      </div>
    </article>
  );
}

export function DoctorsList({ doctors: initialDoctors }: DoctorsListProps) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = doctors.length;
  const active = doctors.filter((doctor) => doctor.isActive).length;
  const inactive = total - active;
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = doctors.findIndex((doctor) => doctor.id === active.id);
    const newIndex = doctors.findIndex((doctor) => doctor.id === over.id);
    const previous = doctors;
    const next = arrayMove(doctors, oldIndex, newIndex);
    setDoctors(next);
    try {
      await doctorsClientApi.reorderDoctors(next.map((doctor) => doctor.id));
    } catch {
      setDoctors(previous);
      setError("Не удалось сохранить порядок врачей.");
    }
  };

  const doctorIds = doctors.map((doctor) => doctor.id);

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
          doctors.map((doctor) => (
            <MobileDoctorCard
              key={doctor.id}
              doctor={doctor}
              onSwitch={handleSwitch}
              onDelete={handleDelete}
              deleting={busyId === doctor.id}
            />
          ))
        )}
      </div>

      <div className="hidden md:block overflow-hidden rounded-lg border bg-card">
        <DndContext
          id="doctors-dnd"
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-10 px-2">
                  <span className="sr-only">Перемещение</span>
                </TableHead>
                <TableHead>Врач</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-10 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={doctorIds}
                strategy={verticalListSortingStrategy}
              >
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Врачей пока нет.
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <SortableDoctorRow
                      key={doctor.id}
                      doctor={doctor}
                      onSwitch={handleSwitch}
                      onDelete={handleDelete}
                      deleting={busyId === doctor.id}
                    />
                  ))
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
