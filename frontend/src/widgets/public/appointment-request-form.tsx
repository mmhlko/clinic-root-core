"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "@/components/ui/toast";
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
import { Textarea } from "@/components/ui/textarea";
import { appointmentRequestsApi } from "@/features/appointment-requests/api/appointment-requests-api";
import type { Service } from "@/features/content/types/content.types";
import type { DoctorListItem } from "@/features/doctors/types/doctors.types";
import { validateRussianMobilePhone } from "@/lib/validation/phone";

export function AppointmentRequestForm({
  services,
  doctors,
}: {
  services: Service[];
  doctors: DoctorListItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const serviceItems = [
    { label: "Не выбрано", value: null },
    ...services.map((service) => ({
      label: service.name,
      value: service.id,
    })),
  ];
  const doctorItems = [
    { label: "Не выбрано", value: null },
    ...doctors.map((doctor) => ({
      label: `${doctor.lastName} ${doctor.firstName}`,
      value: doctor.id,
    })),
  ];
  if (done)
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-xl font-semibold">Заявка отправлена</h3>
        <p className="mt-2 text-muted-foreground">
          Мы свяжемся с вами по указанному телефону.
        </p>
      </div>
    );
  return (
    <form
      className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        if (loading) return;

        const form = event.currentTarget;
        const f = new FormData(form);
        const phone = String(f.get("phone") ?? "");
        const validationError = validateRussianMobilePhone(phone);
        setPhoneError(validationError);
        if (validationError) return;

        setLoading(true);
        try {
          await appointmentRequestsApi.create({
            name: String(f.get("name")),
            phone: phone.trim(),
            serviceId,
            doctorId,
            comment: String(f.get("comment") || "") || null,
          });
          setDone(true);
        } catch (error: unknown) {
          let description = "Не удалось отправить заявку.";
          if (isAxiosError<{ message?: string | string[] }>(error)) {
            const message = error.response?.data?.message;
            if (Array.isArray(message)) {
              description = message.join(" ");
            } else if (message) {
              description = message;
            }
          }
          toast.add({
            type: "error",
            description,
          });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <h3 className="text-xl font-semibold">Записаться на приём</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Оставьте контакты — администратор свяжется с вами.
        </p>
      </div>
      <Input name="name" placeholder="Ваше имя *" required />
      <div className="space-y-1">
        <Input
          name="phone"
          placeholder="Телефон *"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={32}
          required
          aria-invalid={Boolean(phoneError)}
          aria-describedby={phoneError ? "appointment-phone-error" : undefined}
          onChange={(event) => {
            if (
              phoneError &&
              !validateRussianMobilePhone(event.target.value)
            ) {
              setPhoneError(null);
            }
          }}
        />
        {phoneError && (
          <p
            id="appointment-phone-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {phoneError}
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          items={serviceItems}
          value={serviceId}
          onValueChange={setServiceId}
          disabled={loading}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Услуга</SelectLabel>
              {serviceItems.map((item) => (
                <SelectItem key={item.value ?? "none"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          items={doctorItems}
          value={doctorId}
          onValueChange={setDoctorId}
          disabled={loading}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Врач</SelectLabel>
              {doctorItems.map((item) => (
                <SelectItem key={item.value ?? "none"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Textarea name="comment" placeholder="Комментарий" />
      <Button disabled={loading} type="submit" className="w-full">
        {loading ? "Отправка…" : "Оставить заявку"}
      </Button>
    </form>
  );
}
