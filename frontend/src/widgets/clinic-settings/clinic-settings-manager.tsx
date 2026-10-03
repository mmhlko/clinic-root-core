"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  Clinic,
  ClinicFeature,
  ClinicLocation,
  ClinicSocialLink,
  ClinicStatistic,
} from "@/features/content/types/content.types";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { Separator } from "@/components/ui/separator";

type EditableClinicField = Exclude<keyof Clinic, "id">;

type Props = {
  clinic: Clinic;
  locations?: ClinicLocation[];
  features?: ClinicFeature[];
  socialLinks?: ClinicSocialLink[];
  statistics?: ClinicStatistic[];
  canManageLocations?: boolean;
};

export function ClinicSettingsManager({ clinic: initialClinic }: Props) {
  const [clinic, setClinic] = useState(initialClinic);
  const [saving, setSaving] = useState(false);

  const update = (key: EditableClinicField, value: string) => {
    setClinic((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const body: Omit<Clinic, "id"> = {
        name: clinic.name,
        shortDescription: clinic.shortDescription,
        description: clinic.description,
        slogan: clinic.slogan,
        phone: clinic.phone,
        email: clinic.email,
        legalName: clinic.legalName,
        licenseNumber: clinic.licenseNumber,
        licenseDate: clinic.licenseDate,
        inn: clinic.inn,
        ogrn: clinic.ogrn,
      };
      setClinic(await contentClientApi.updateClinic(body));
      toast.add({ type: "success", description: "Изменения сохранены." });
    } catch (error) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(error, "Не удалось сохранить."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="w-full space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <section className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <h3 className="mb-4 text font-semibold">Основная информация</h3>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClinicField
            label="Название"
            value={clinic.name}
            onChange={(value) => update("name", value)}
            required
          />
          <ClinicField
            label="Слоган"
            value={clinic.slogan ?? ""}
            onChange={(value) => update("slogan", value)}
          />
          <ClinicField
            label="Телефон"
            type="tel"
            value={clinic.phone ?? ""}
            onChange={(value) => update("phone", value)}
          />
          <ClinicField
            label="Email"
            type="email"
            value={clinic.email ?? ""}
            onChange={(value) => update("email", value)}
          />
        </div>
        <h3 className="mb-4 font-semibold">Юридическая информация</h3>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ClinicField
            label="Юридическое название"
            value={clinic.legalName ?? ""}
            onChange={(value) => update("legalName", value)}
          />
          <ClinicField
            label="Номер лицензии"
            value={clinic.licenseNumber ?? ""}
            onChange={(value) => update("licenseNumber", value)}
          />
          <ClinicField
            label="Дата лицензии"
            type="date"
            value={
              clinic.licenseDate
                ? new Date(clinic.licenseDate).toISOString().slice(0, 10)
                : ""
            }
            onChange={(value) => update("licenseDate", value)}
          />
          <ClinicField
            label="ИНН"
            value={clinic.inn ?? ""}
            onChange={(value) => update("inn", value)}
          />
          <ClinicField
            label="ОГРН"
            value={clinic.ogrn ?? ""}
            onChange={(value) => update("ogrn", value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <ClinicField
            label="Краткое описание"
            value={clinic.shortDescription ?? ""}
            onChange={(value) => update("shortDescription", value)}
            multiline
          />
          <ClinicField
            label="Описание"
            value={clinic.description ?? ""}
            onChange={(value) => update("description", value)}
            multiline
          />
        </div>
      </section>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  );
}

function ClinicField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const id = `clinic-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
