"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { appointmentRequestsApi } from "../api/appointment-requests-api";
import type { AppointmentRequest } from "../types/appointment-request.types";

interface RequestDeleteDialogProps {
  request: AppointmentRequest;
  onDeleted: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function RequestDeleteDialog({ request, onDeleted, open: controlledOpen, onOpenChange: controlledOnOpenChange, hideTrigger = false }: RequestDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);

    try {
      await appointmentRequestsApi.delete(request.id);
      setOpen(false);
      onDeleted(request.id);
    } catch (requestError) {
      const message = isAxiosError<{ message?: string | string[] }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(Array.isArray(message) ? message.join(" ") : message ?? "Не удалось удалить заявку.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          <Trash2Icon data-icon="inline-start" />
          Удалить
        </AlertDialogTrigger>
      )}
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
          <AlertDialogDescription>
            Заявка от <strong>{request.name}</strong> будет удалена без возможности восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
            {deleting ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
