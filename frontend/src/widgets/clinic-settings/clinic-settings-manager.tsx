"use client";

import { useState, type ReactNode } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { contentClientApi } from "@/features/content/api/content-client-api";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { toast } from "@/components/ui/toast";
import type {
  Clinic,
  ClinicFeature,
  ClinicLocation,
  ClinicSocialLink,
  ClinicStatistic,
} from "@/features/content/types/content.types";

type Props = {
  clinic: Clinic;
  locations: ClinicLocation[];
  features: ClinicFeature[];
  socialLinks: ClinicSocialLink[];
  statistics: ClinicStatistic[];
  canManageLocations: boolean;
};

export function ClinicSettingsManager(props: Props) {
  const [clinic, setClinic] = useState(props.clinic);
  const [locations, setLocations] = useState(props.locations);
  const [features, setFeatures] = useState(props.features);
  const [socialLinks, setSocialLinks] = useState(props.socialLinks);
  const [statistics, setStatistics] = useState(props.statistics);
  const [saving, setSaving] = useState(false);
  const save = async (fn: () => Promise<any>) => {
    setSaving(true);
    try {
      await fn();
      toast.add({
        type: "success",
        description: "Изменения сохранены.",
      });
    } catch (e: any) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(e, "Не удалось сохранить."),
      });
    } finally {
      setSaving(false);
    }
  };
  const update = (k: keyof Clinic, v: any) => setClinic({ ...clinic, [k]: v });
  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Данные клиники</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Название"
            value={clinic.name}
            onChange={(v) => update("name", v)}
          />
          <Field
            label="Слоган"
            value={clinic.slogan ?? ""}
            onChange={(v) => update("slogan", v)}
          />
          <Field
            label="Телефон"
            value={clinic.phone ?? ""}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label="Email"
            value={clinic.email ?? ""}
            onChange={(v) => update("email", v)}
          />
          <Field
            label="Юридическое название"
            value={clinic.legalName ?? ""}
            onChange={(v) => update("legalName", v)}
          />
          <Field
            label="Номер лицензии"
            value={clinic.licenseNumber ?? ""}
            onChange={(v) => update("licenseNumber", v)}
          />
          <Field
            label="Дата лицензии"
            type="date"
            value={
              clinic.licenseDate
                ? new Date(clinic.licenseDate).toISOString().slice(0, 10)
                : ""
            }
            onChange={(v) => update("licenseDate", v)}
          />
          <Field
            label="ИНН"
            value={clinic.inn ?? ""}
            onChange={(v) => update("inn", v)}
          />
          <Field
            label="ОГРН"
            value={clinic.ogrn ?? ""}
            onChange={(v) => update("ogrn", v)}
          />
        </div>
        <Field
          label="Краткое описание"
          value={clinic.shortDescription ?? ""}
          onChange={(v) => update("shortDescription", v)}
          textarea
        />
        <Field
          label="Описание"
          value={clinic.description ?? ""}
          onChange={(v) => update("description", v)}
          textarea
        />
        <Button
          disabled={saving}
          onClick={() =>
            void save(async () =>
              setClinic(
                await contentClientApi.updateClinic(
                  (({ id, ...rest }) => rest)(clinic),
                ),
              ),
            )
          }
        >
          <Save data-icon="inline-start" />
          Сохранить клинику
        </Button>
      </section>
      <ListSection
        title="Филиалы"
        canAdd={props.canManageLocations}
        onAdd={() =>
          setLocations([
            ...locations,
            {
              id: `new-${Date.now()}`,
              name: "",
              address: "",
              phone: null,
              email: null,
              workingHours: null,
              mapUrl: null,
              description: null,
              sortOrder: locations.length,
              isActive: true,
            },
          ])
        }
      >
        {locations.map((x, i) => (
          <LocationRow
            key={x.id}
            item={x}
            disabled={!props.canManageLocations}
            saving={saving}
            onChange={(v) =>
              setLocations(
                locations.map((y) => (y.id === x.id ? { ...y, ...v } : y)),
              )
            }
            onSave={() =>
              void save(async () => {
                const result = x.id.startsWith("new-")
                  ? await contentClientApi.createLocation(x)
                  : await contentClientApi.updateLocation(x.id, x);
                setLocations(
                  locations.map((y) => (y.id === x.id ? result : y)),
                );
              })
            }
            onActive={(v) =>
              void save(async () => {
                const result = await contentClientApi.setLocationActive(
                  x.id,
                  v,
                );
                setLocations(
                  locations.map((y) => (y.id === x.id ? result : y)),
                );
              })
            }
          />
        ))}
      </ListSection>
      <ListSection
        title="Преимущества"
        canAdd
        onAdd={() =>
          setFeatures([
            ...features,
            {
              id: `new-${Date.now()}`,
              title: "",
              description: null,
              imageUrl: null,
              icon: null,
              sortOrder: features.length,
              isActive: true,
            },
          ])
        }
      >
        {features.map((x) => (
          <div
            key={x.id}
            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <Input
              value={x.title}
              placeholder="Заголовок"
              onChange={(e) =>
                setFeatures(
                  features.map((y) =>
                    y.id === x.id ? { ...y, title: e.target.value } : y,
                  ),
                )
              }
            />
            <Input
              value={x.description ?? ""}
              placeholder="Описание"
              onChange={(e) =>
                setFeatures(
                  features.map((y) =>
                    y.id === x.id ? { ...y, description: e.target.value } : y,
                  ),
                )
              }
            />
            <Input
              value={x.imageUrl ?? ""}
              placeholder="URL изображения"
              onChange={(e) =>
                setFeatures(
                  features.map((y) =>
                    y.id === x.id ? { ...y, imageUrl: e.target.value } : y,
                  ),
                )
              }
            />
            <Switch
              checked={x.isActive}
              onCheckedChange={(v) =>
                setFeatures(
                  features.map((y) =>
                    y.id === x.id ? { ...y, isActive: v } : y,
                  ),
                )
              }
            />
          </div>
        ))}
        <Button
          disabled={saving}
          onClick={() =>
            void save(async () =>
              setFeatures(
                await contentClientApi.saveFeatures(
                  features.map(({ id, ...x }) =>
                    id.startsWith("new-") ? x : { id, ...x },
                  ) as any,
                ),
              ),
            )
          }
        >
          <Save data-icon="inline-start" />
          Сохранить преимущества
        </Button>
      </ListSection>
      <ListSection
        title="Социальные сети"
        canAdd
        onAdd={() =>
          setSocialLinks([
            ...socialLinks,
            {
              id: `new-${Date.now()}`,
              platform: "vk",
              url: "",
              sortOrder: socialLinks.length,
              isActive: true,
            },
          ])
        }
      >
        {socialLinks.map((x) => (
          <div
            key={x.id}
            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[180px_1fr_auto]"
          >
            <select
              value={x.platform}
              onChange={(e) =>
                setSocialLinks(
                  socialLinks.map((y) =>
                    y.id === x.id ? { ...y, platform: e.target.value } : y,
                  ),
                )
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {["vk", "telegram", "max", "whatsapp", "youtube", "rutube"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
            <Input
              value={x.url}
              onChange={(e) =>
                setSocialLinks(
                  socialLinks.map((y) =>
                    y.id === x.id ? { ...y, url: e.target.value } : y,
                  ),
                )
              }
            />
            <Switch
              checked={x.isActive}
              onCheckedChange={(v) =>
                setSocialLinks(
                  socialLinks.map((y) =>
                    y.id === x.id ? { ...y, isActive: v } : y,
                  ),
                )
              }
            />
          </div>
        ))}
        <Button
          disabled={saving}
          onClick={() =>
            void save(async () =>
              setSocialLinks(
                await contentClientApi.saveSocialLinks(
                  socialLinks.map(({ id, ...x }) =>
                    id.startsWith("new-") ? x : { id, ...x },
                  ) as any,
                ),
              ),
            )
          }
        >
          <Save data-icon="inline-start" />
          Сохранить соцсети
        </Button>
      </ListSection>
      <ListSection
        title="Статистика"
        canAdd
        onAdd={() =>
          setStatistics([
            ...statistics,
            {
              id: `new-${Date.now()}`,
              value: "",
              label: "",
              sortOrder: statistics.length,
              isActive: true,
            },
          ])
        }
      >
        {statistics.map((x) => (
          <div
            key={x.id}
            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[180px_1fr_auto]"
          >
            <Input
              value={x.value}
              placeholder="Значение"
              onChange={(e) =>
                setStatistics(
                  statistics.map((y) =>
                    y.id === x.id ? { ...y, value: e.target.value } : y,
                  ),
                )
              }
            />
            <Input
              value={x.label}
              placeholder="Подпись"
              onChange={(e) =>
                setStatistics(
                  statistics.map((y) =>
                    y.id === x.id ? { ...y, label: e.target.value } : y,
                  ),
                )
              }
            />
            <Switch
              checked={x.isActive}
              onCheckedChange={(v) =>
                setStatistics(
                  statistics.map((y) =>
                    y.id === x.id ? { ...y, isActive: v } : y,
                  ),
                )
              }
            />
          </div>
        ))}
        <Button
          disabled={saving}
          onClick={() =>
            void save(async () =>
              setStatistics(
                await contentClientApi.saveStatistics(
                  statistics.map(({ id, ...x }) =>
                    id.startsWith("new-") ? x : { id, ...x },
                  ) as any,
                ),
              ),
            )
          }
        >
          <Save data-icon="inline-start" />
          Сохранить статистику
        </Button>
      </ListSection>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
function ListSection({
  title,
  canAdd,
  onAdd,
  children,
}: {
  title: string;
  canAdd: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {canAdd && (
          <Button variant="outline" onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Добавить
          </Button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function LocationRow({
  item,
  onChange,
  onSave,
  onActive,
  disabled,
  saving,
}: {
  item: ClinicLocation;
  onChange: (v: Partial<ClinicLocation>) => void;
  onSave: () => void;
  onActive: (v: boolean) => void;
  disabled: boolean;
  saving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          disabled={disabled}
          value={item.name}
          placeholder="Название"
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <Input
          disabled={disabled}
          value={item.address}
          placeholder="Адрес"
          onChange={(e) => onChange({ address: e.target.value })}
        />
        <Input
          disabled={disabled}
          value={item.phone ?? ""}
          placeholder="Телефон"
          onChange={(e) => onChange({ phone: e.target.value })}
        />
        <Input
          disabled={disabled}
          value={item.email ?? ""}
          placeholder="Email"
          onChange={(e) => onChange({ email: e.target.value })}
        />
        <Input
          disabled={disabled}
          value={item.mapUrl ?? ""}
          placeholder="URL карты"
          onChange={(e) => onChange({ mapUrl: e.target.value })}
        />
      </div>
      <Textarea
        disabled={disabled}
        value={item.description ?? ""}
        placeholder="Описание"
        onChange={(e) => onChange({ description: e.target.value })}
      />
      <div className="flex flex-wrap gap-2">
        <Switch
          disabled={disabled || item.id.startsWith("new-")}
          checked={item.isActive}
          onCheckedChange={onActive}
        />
        <Button disabled={disabled || saving} size="sm" onClick={onSave}>
          <Save data-icon="inline-start" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}
