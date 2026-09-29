"use client";

import { useEffect, useState } from "react";
import { CalendarDaysIcon, PencilIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { statusColorsStyles } from "@/shared/constants/colors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestDeleteDialog } from "@/features/appointment-requests/components/request-delete-dialog";
import { RequestEditForm } from "@/features/appointment-requests/components/request-edit-form";
import { type AppointmentRequest } from "@/features/appointment-requests/types/appointment-request.types";
import { EStatusVariant } from "@/shared/types/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

interface RequestDetailsSheetProps {
  request: AppointmentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (request: AppointmentRequest) => void;
  onDeleted: (id: string) => void;
  startEditing?: boolean;
  onStatusChange?: (status: EStatusVariant) => void;
  onEdit: () => void;
}

export function RequestDetailsSheet({ request, open, onOpenChange, onUpdated, onDeleted, startEditing = false, onStatusChange, onEdit }: RequestDetailsSheetProps) {
  const statusItems = [
    { label: "Новая", value: EStatusVariant.NEW },
    { label: "В работе", value: EStatusVariant.IN_PROGRESS },
    { label: "Завершена", value: EStatusVariant.COMPLETED },
    { label: "Отменена", value: EStatusVariant.CANCELLED },
  ];

  if (!request) return null;

  const handleSaved = (updated: AppointmentRequest) => {
    onUpdated(updated);
  };

  const handleDeleted = (id: string) => {
    onDeleted(id);
    onOpenChange(false);
  };
  

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="responsive"
        className="max-h-[80dvh] sm:max-h-none"
      >
        {startEditing ? (
          <>
            <SheetHeader>
              <SheetTitle>Редактирование заявки</SheetTitle>
              <SheetDescription>Измените контактные данные и комментарий пациента.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <RequestEditForm request={request} onSaved={handleSaved} onCancel={() => onOpenChange(false)} />
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-center gap-2 pr-8">
                <SheetTitle className="truncate">Заявка №{request.id}</SheetTitle>
                <Badge variant="outline" className={statusColorsStyles[request.status]}>
                  {statusItems.find((item) => item.value === request.status)?.label}
                </Badge>
              </div>
              <SheetDescription>Обращение пациента</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Статус</h3>
                <Select<EStatusVariant>
                  items={statusItems}
                  value={request.status}
                  onValueChange={(value) => {
                    if (value) onStatusChange?.(value);
                  }}
                >
                  <SelectTrigger className={`w-full sm:w-52 ${statusColorsStyles[request.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Пациент</h3>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{request.name}</p>
                  <a href={`tel:${request.phone}`} className="mt-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <PhoneIcon className="size-4" />
                    {request.phone}
                  </a>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Детали обращения</h3>
                <dl className="divide-y rounded-lg border">
                  <div className="grid grid-cols-[110px_1fr] gap-3 p-3 text-sm">
                    <dt className="text-muted-foreground">Услуга</dt>
                    <dd>{request.service?.name ?? "Не указана"}</dd>
                  </div>
                  <div className="grid grid-cols-[110px_1fr] gap-3 p-3 text-sm">
                    <dt className="text-muted-foreground">Врач</dt>
                    <dd>{request.doctor ? `${request.doctor.lastName} ${request.doctor.firstName}` : "Не указан"}</dd>
                  </div>
                  <div className="grid gap-1 p-3 text-sm">
                    <dt className="text-muted-foreground">Комментарий</dt>
                    <dd className="whitespace-pre-wrap">{request.comment || "Нет комментария"}</dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Дата создания</h3>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDaysIcon className="size-4" />
                  {formatDate(request.createdAt)}
                </p>
              </section>
            </div>

            <SheetFooter className="border-t sm:justify-between flex-col-reverse">
              <RequestDeleteDialog request={request} onDeleted={handleDeleted} />
              <Button onClick={onEdit}>
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
