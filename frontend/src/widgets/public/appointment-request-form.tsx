"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appointmentRequestsApi } from "@/features/appointment-requests/api/appointment-requests-api";
import type { Service } from "@/features/content/types/content.types";
import type { DoctorListItem } from "@/features/doctors/types/doctors.types";

export function AppointmentRequestForm({
  services,
  doctors,
}: {
  services: Service[];
  doctors: DoctorListItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const f = new FormData(e.currentTarget);
        try {
          await appointmentRequestsApi.create({
            name: String(f.get("name")),
            phone: String(f.get("phone")),
            serviceId: String(f.get("serviceId") || "") || null,
            doctorId: String(f.get("doctorId") || "") || null,
            comment: String(f.get("comment") || "") || null,
          });
          setDone(true);
        } catch (err: any) {
          toast.add({
            type: "error",
            description:
              err?.response?.data?.message ?? "Не удалось отправить заявку.",
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
      <Input name="name" placeholder="Ваше имя" required />
      <Input name="phone" placeholder="Телефон" type="tel" required />
      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="serviceId"
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Услуга</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="doctorId"
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Врач</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.lastName} {d.firstName}
            </option>
          ))}
        </select>
      </div>
      <Textarea name="comment" placeholder="Комментарий" />
      <Button disabled={loading} type="submit" className="w-full">
        {loading ? "Отправка…" : "Оставить заявку"}
      </Button>
    </form>
  );
}
