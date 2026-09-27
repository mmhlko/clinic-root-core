"use client";

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

import { DoctorListItem } from "@/features/doctors/types/doctors.types";
import { doctorsClientApi } from "@/features/doctors/api/doctors-client-api";

import { MoreHorizontalIcon, GripVerticalIcon } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListStats } from "@/components/admin/list-stats";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/shared/helpers/getImageUrl";

type DoctorsListProps = {
  doctors: DoctorListItem[];
};

type SortableDoctorRowProps = {
  doctor: DoctorListItem;
  onSwitch: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
};

const DragHandle = ({ id }: { id: string }) => {
  const { attributes, listeners } = useSortable({
    id,
  });

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
};

const SortableDoctorRow = ({
  doctor,
  onSwitch,
  onDelete,
}: SortableDoctorRowProps) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: doctor.id,
  });

  const avatarUrl = getImageUrl(doctor.photoUrl);

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag handle */}
      <TableCell className="w-10 px-2">
        <DragHandle id={doctor.id} />
      </TableCell>

      {/* Doctor */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 rounded-full">
            <AvatarImage src={avatarUrl} alt={getDoctorFullName(doctor)} />
            <AvatarFallback>
              {doctor.firstName?.[0] ?? "В"}
              {doctor.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{getDoctorFullName(doctor)}</span>
            <span className="text-xs text-muted-foreground">
              {doctor.specialization}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Visibility */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={doctor.isActive}
            onCheckedChange={(checked) => onSwitch(doctor.id, checked)}
          />

          <Badge variant={doctor.isActive ? "default" : "outline"}>
            {doctor.isActive ? "Активен" : "Скрыт"}
          </Badge>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-10 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon />
                <span className="sr-only">Открыть меню</span>
              </Button>
            }
          />

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Редактировать</DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(doctor.id)}
            >
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export const DoctorsList = ({ doctors: initialDoctors }: DoctorsListProps) => {
  const [doctors, setDoctors] = useState<DoctorListItem[]>(initialDoctors);
  const total = doctors.length;
  const active = doctors.filter((doctor) => doctor.isActive).length;
  const inactive = total - active;

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleSwitch = async (id: string, isActive: boolean) => {
    const data = await doctorsClientApi.updateDoctorStatus(id, isActive);

    setDoctors((current) =>
      current.map((doctor) =>
        doctor.id === id
          ? {
              ...doctor,
              isActive: data.isActive,
            }
          : doctor,
      ),
    );
  };

  const handleDelete = async (id: string) => {
    await doctorsClientApi.deleteDoctor(id);

    setDoctors((current) => current.filter((doctor) => doctor.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = doctors.findIndex((doctor) => doctor.id === active.id);

    const newIndex = doctors.findIndex((doctor) => doctor.id === over.id);

    const newDoctors = arrayMove(doctors, oldIndex, newIndex);

    setDoctors(newDoctors);

    try {
      await doctorsClientApi.reorderDoctors(
        newDoctors.map((doctor) => doctor.id),
      );
    } catch {
      setDoctors(doctors);
    }
  };

  const doctorIds = doctors.map((doctor) => doctor.id);

  return (
    <div className="space-y-2">
      <ListStats total={total} active={active} inactive={inactive} />

      <DndContext
        id="doctors-dnd"
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden bg-card rounded-lg border">
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
                {doctors.map((doctor) => (
                  <SortableDoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    onSwitch={handleSwitch}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>
    </div>
  );
};
