"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { appointmentRequestsApi } from "../api/appointment-requests-api";
import type { AppointmentRequest, UpdateAppointmentRequestDto } from "../types/appointment-request.types";

interface RequestEditFormProps {
  request: AppointmentRequest;
  onSaved: (request: AppointmentRequest) => void;
  onCancel: () => void;
}

function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (message) return message;
  }
  return "Не удалось сохранить заявку. Проверьте данные и попробуйте ещё раз.";
}

export function RequestEditForm({ request, onSaved, onCancel }: RequestEditFormProps) {
  const [name, setName] = useState(request.name);
  const [phone, setPhone] = useState(request.phone);
  const [comment, setComment] = useState(request.comment ?? "");
  const [clearService, setClearService] = useState(false);
  const [clearDoctor, setClearDoctor] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(request.name);
    setPhone(request.phone);
    setComment(request.comment ?? "");
    setClearService(false);
    setClearDoctor(false);
  }, [request]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      toast.add({
        type: "error",
        description: "Имя и телефон обязательны.",
      });
      return;
    }

    const dto: UpdateAppointmentRequestDto = {
      name: trimmedName,
      phone: trimmedPhone,
      comment: comment.trim() || null,
    };

    if (clearService) dto.serviceId = null;
    if (clearDoctor) dto.doctorId = null;

    setSaving(true);

    try {
      const updated = await appointmentRequestsApi.update(request.id, dto);
      toast.add({
        type: "success",
        description: "Заявка обновлена.",
      });
      onSaved(updated);
    } catch (requestError) {
      toast.add({
        type: "error",
        description: getErrorMessage(requestError),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="request-name" required>Имя</Label>
          <Input id="request-name" value={name} onChange={(event) => setName(event.target.value)} disabled={saving} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="request-phone" required>Телефон</Label>
          <Input id="request-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={saving} required />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">Услуга</p>
            <p className="text-muted-foreground">{request.service?.name ?? "Не указана"}</p>
          </div>
          {request.service && (
            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setClearService((value) => !value)}>
              {clearService ? "Оставить" : "Убрать"}
            </Button>
          )}
        </div>
        {clearService && <p className="mt-2 text-xs text-destructive">После сохранения услуга будет очищена.</p>}
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">Врач</p>
            <p className="text-muted-foreground">
              {request.doctor ? `${request.doctor.lastName} ${request.doctor.firstName}` : "Не указан"}
            </p>
          </div>
          {request.doctor && (
            <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setClearDoctor((value) => !value)}>
              {clearDoctor ? "Оставить" : "Убрать"}
            </Button>
          )}
        </div>
        {clearDoctor && <p className="mt-2 text-xs text-destructive">После сохранения врач будет очищен.</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="request-comment">Комментарий</Label>
        <Textarea id="request-comment" value={comment} onChange={(event) => setComment(event.target.value)} disabled={saving} rows={5} placeholder="Комментарий пациента" />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Отмена</Button>
        <Button type="submit" disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</Button>
      </div>
    </form>
  );
}
