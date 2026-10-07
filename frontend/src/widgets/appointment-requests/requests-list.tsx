"use client";

import { useMemo, useState } from "react";
import {
  CircleCheckIcon,
  CirclePlusIcon,
  CircleXIcon,
  Clock3Icon,
  ListIcon,
  MoreHorizontalIcon,
  SearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContentFilterTabs,
  type ContentFilterTab,
} from "@/components/shared/content-filter-tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { appointmentRequestsApi } from "@/features/appointment-requests/api/appointment-requests-api";
import {
  type AppointmentRequest,
} from "@/features/appointment-requests/types/appointment-request.types";
import { statusColorsStyles } from "@/shared/constants/colors";
import { RequestDeleteDialog } from "@/features/appointment-requests/components/request-delete-dialog";
import { RequestDetailsSheet } from "./request-details-sheet";
import { EStatusVariant } from "@/shared/types/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const statusItems = [
  { label: "Новая", value: EStatusVariant.NEW },
  { label: "В работе", value: EStatusVariant.IN_PROGRESS },
  { label: "Завершена", value: EStatusVariant.COMPLETED },
  { label: "Отменена", value: EStatusVariant.CANCELLED },
];

type RequestFilter = EStatusVariant | "all";

function RequestStatusSelect({
  request,
  updatingId,
  onChange,
}: {
  request: AppointmentRequest;
  updatingId: string | null;
  onChange: (status: EStatusVariant) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Select<EStatusVariant>
        items={statusItems}
        value={request.status}
        onValueChange={(value) => {
          if (value) onChange(value);
        }}
        disabled={updatingId === request.id}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger
          className={`w-full sm:w-40 ${statusColorsStyles[request.status]}`}
          aria-label="Статус заявки"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Изменить статус</SelectLabel>
            {statusItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function DoctorName({ request }: { request: AppointmentRequest }) {
  if (!request.doctor) return <>Не указан</>;
  return (
    <>
      {request.doctor.lastName} {request.doctor.firstName}
    </>
  );
}

function RequestActions({
  request,
  onView,
  onEdit,
  onDelete,
}: {
  request: AppointmentRequest;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Действия: ${request.name}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>Просмотреть</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>Редактировать</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RequestsList({
  requests: initialRequests,
}: {
  requests: AppointmentRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RequestFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<AppointmentRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOnOpen, setEditOnOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentRequest | null>(
    null,
  );

  const counts = useMemo(
    () => ({
      total: requests.length,
      new: requests.filter(
        (request) => request.status === EStatusVariant.NEW,
      ).length,
      inProgress: requests.filter(
        (request) => request.status === EStatusVariant.IN_PROGRESS,
      ).length,
      completed: requests.filter(
        (request) => request.status === EStatusVariant.COMPLETED,
      ).length,
    }),
    [requests],
  );

  const filterTabs = useMemo<ContentFilterTab<RequestFilter>[]>(
    () => [
      {
        value: "all",
        label: "Все",
        count: requests.length,
        icon: ListIcon,
      },
      {
        value: EStatusVariant.NEW,
        label: "Новые",
        count: requests.filter((request) => request.status === EStatusVariant.NEW).length,
        icon: CirclePlusIcon,
        badgeStyle: statusColorsStyles[EStatusVariant.NEW],
      },
      {
        value: EStatusVariant.IN_PROGRESS,
        label: "В работе",
        count: requests.filter((request) => request.status === EStatusVariant.IN_PROGRESS).length,
        icon: Clock3Icon,
        badgeStyle: statusColorsStyles[EStatusVariant.IN_PROGRESS],
      },
      {
        value: EStatusVariant.COMPLETED,
        label: "Завершённые",
        count: requests.filter((request) => request.status === EStatusVariant.COMPLETED).length,
        icon: CircleCheckIcon,
        badgeStyle: statusColorsStyles[EStatusVariant.COMPLETED],
      },
      {
        value: EStatusVariant.CANCELLED,
        label: "Отменённые",
        count: requests.filter((request) => request.status === EStatusVariant.CANCELLED).length,
        icon: CircleXIcon,
        badgeStyle: statusColorsStyles[EStatusVariant.CANCELLED],
      },
    ],
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = status === "all" || request.status === status;
      const matchesQuery =
        !normalizedQuery ||
        request.name.toLowerCase().includes(normalizedQuery) ||
        request.phone.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, requests, status]);
  const emptyRequestsMessage =
    requests.length === 0
      ? "Заявок пока нет"
      : status !== "all" && !query.trim()
        ? "Заявок с таким статусом пока нет"
        : "По вашему запросу ничего не найдено";

  function openRequest(request: AppointmentRequest, edit = false) {
    setSelectedRequest(request);
    setEditOnOpen(edit);
    setDetailsOpen(true);
  }

  async function handleStatusChange(
    request: AppointmentRequest,
    nextStatus: EStatusVariant,
  ) {
    if (request.status === nextStatus || updatingId) return;
    const previousStatus = request.status;
    setUpdatingId(request.id);
    setRequests((current) =>
      current.map((item) =>
        item.id === request.id ? { ...item, status: nextStatus } : item,
      ),
    );
    setSelectedRequest((current) =>
      current?.id === request.id ? { ...current, status: nextStatus } : current,
    );

    try {
      const updated = await appointmentRequestsApi.updateStatus(request.id, {
        status: nextStatus,
      });
      setRequests((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedRequest((current) =>
        current?.id === updated.id ? updated : current,
      );
    } catch {
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id ? { ...item, status: previousStatus } : item,
        ),
      );
      setSelectedRequest((current) =>
        current?.id === request.id
          ? { ...current, status: previousStatus }
          : current,
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function updateRequest(updated: AppointmentRequest) {
    setRequests((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedRequest(updated);
  }

  function deleteRequest(id: string) {
    setRequests((current) => current.filter((item) => item.id !== id));
    if (selectedRequest?.id === id) {
      setSelectedRequest(null);
      setDetailsOpen(false);
    }
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по имени или телефону"
            className="pl-9"
          />
        </div>
      </div>
      <ContentFilterTabs
        value={status}
        onValueChange={setStatus}
        items={filterTabs}
      />

      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Пациент</TableHead>
              <TableHead>Услуга</TableHead>
              <TableHead>Врач</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-10 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow
                key={request.id}
                className="cursor-pointer"
                onClick={() => openRequest(request)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{request.name}</span>
                    <a
                      href={`tel:${request.phone}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {request.phone}
                    </a>
                  </div>
                </TableCell>
                <TableCell>{request.service?.name ?? "Не указана"}</TableCell>
                <TableCell>
                  <DoctorName request={request} />
                </TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>
                  <RequestStatusSelect
                    request={request}
                    updatingId={updatingId}
                    onChange={(nextStatus) =>
                      void handleStatusChange(request, nextStatus)
                    }
                  />
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <RequestActions
                    request={request}
                    onView={() => openRequest(request)}
                    onEdit={() => openRequest(request, true)}
                    onDelete={() => setDeleteTarget(request)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyRequestsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredRequests.map((request) => (
          <article
            key={request.id}
            className="rounded-lg border bg-card p-3 shadow-xs sm:p-4"
            onClick={() => openRequest(request)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{request.name}</p>
                <a
                  href={`tel:${request.phone}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm text-muted-foreground"
                >
                  {request.phone}
                </a>
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <RequestActions
                  request={request}
                  onView={() => openRequest(request)}
                  onEdit={() => openRequest(request, true)}
                  onDelete={() => setDeleteTarget(request)}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Услуга</p>
                <p className="mt-1 truncate">
                  {request.service?.name ?? "Не указана"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Врач</p>
                <p className="mt-1 truncate">
                  <DoctorName request={request} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дата</p>
                <p className="mt-1">{formatDate(request.createdAt)}</p>
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <p className="mb-1 text-xs text-muted-foreground">Статус</p>
                <RequestStatusSelect
                  request={request}
                  updatingId={updatingId}
                  onChange={(nextStatus) =>
                    void handleStatusChange(request, nextStatus)
                  }
                />
              </div>
            </div>
          </article>
        ))}
        {filteredRequests.length === 0 && (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            {emptyRequestsMessage}
          </div>
        )}
      </div>

      <RequestDetailsSheet
        request={selectedRequest}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setEditOnOpen(false);
        }}
        onUpdated={updateRequest}
        onDeleted={deleteRequest}
        startEditing={editOnOpen}
        onStatusChange={(nextStatus) => {
          if (selectedRequest)
            void handleStatusChange(selectedRequest, nextStatus);
        }}
        onEdit={() => setEditOnOpen(true)}
      />

      {deleteTarget && (
        <RequestDeleteDialog
          request={deleteTarget}
          onDeleted={deleteRequest}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          hideTrigger
        />
      )}
    </div>
  );
}
