"use client";

import { useEffect, useState, type FormEvent } from "react";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  Clinic,
  ClinicStatus,
  CreatedTenantClinic,
} from "@/features/content/types/content.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusLabels: Record<ClinicStatus, string> = {
  demo: "Демо",
  active: "Активна",
  archived: "Архив",
};

export function ClinicPlatformManager() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [slugs, setSlugs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTenantClinic | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const result = await contentClientApi.platformClinics();
      setClinics(result);
      setSlugs(Object.fromEntries(result.map((clinic) => [clinic.id, clinic.slug])));
      setError(null);
    } catch {
      setError("Не удалось загрузить список клиник. Проверьте права root-администратора.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function createClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    setSaving(true);
    setError(null);
    setCreated(null);
    try {
      const result = await contentClientApi.createPlatformClinic({
        clinic: {
          name: value("clinicName"),
          slug: value("slug").toLowerCase(),
        },
        admin: {
          firstName: value("firstName"),
          lastName: value("lastName"),
          email: value("email").toLowerCase(),
          password: String(form.get("password") ?? ""),
        },
      });
      setCreated(result);
      formElement.reset();
      await reload();
    } catch (cause) {
      setError(
        typeof cause === "object" && cause && "response" in cause
          ? "Не удалось создать клинику. Проверьте уникальность slug и email администратора."
          : "Не удалось создать клинику.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(clinic: Clinic, status: ClinicStatus) {
    setError(null);
    try {
      const updated = await contentClientApi.updatePlatformClinic(clinic.id, { status });
      setClinics((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError("Не удалось обновить статус клиники.");
    }
  }

  async function updateSlug(clinic: Clinic) {
    const slug = slugs[clinic.id]?.trim().toLowerCase();
    if (!slug || slug === clinic.slug) return;
    setError(null);
    try {
      const updated = await contentClientApi.updatePlatformClinic(clinic.id, { slug });
      setClinics((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError("Не удалось изменить slug. Проверьте, что он не занят.");
      setSlugs((items) => ({ ...items, [clinic.id]: clinic.slug }));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Клиники</h1>
        <p className="mt-2 text-muted-foreground">Управление сайтами и доступом клиентов.</p>
      </header>

      {error && <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}

      <section className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Создать клинику и администратора</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={createClinic}>
          <Input name="clinicName" placeholder="Название клиники" required />
          <Input name="slug" placeholder="slug, например medika" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          <Input name="firstName" placeholder="Имя администратора" required />
          <Input name="lastName" placeholder="Фамилия администратора" required />
          <Input name="email" type="email" placeholder="Email администратора" required />
          <Input name="password" type="text" minLength={6} placeholder="Пароль для передачи клиенту" required />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Создаём…" : "Создать клинику"}</Button>
          </div>
        </form>
      </section>

      {created && (
        <section className="rounded-xl border border-primary/40 bg-primary/5 p-5" aria-live="polite">
          <h2 className="font-semibold">Клиника создана. Данные для передачи клиенту</h2>
          <p className="mt-2">{created.clinic.name}: <a className="underline" href={`/${created.clinic.slug}/admin`}>открыть админку</a></p>
          <p className="mt-1">Логин: <strong>{created.admin.email}</strong></p>
          <p className="mt-1">Пароль: <strong>{created.admin.initialPassword}</strong></p>
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            onClick={() => void navigator.clipboard.writeText(`${created.admin.email}\n${created.admin.initialPassword}`)}
          >
            Скопировать доступ
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Существующие клиники</h2>
        {loading ? <p className="text-muted-foreground">Загружаем…</p> : clinics.length === 0 ? <p className="text-muted-foreground">Клиник пока нет.</p> : clinics.map((clinic) => (
          <article key={clinic.id} className="grid gap-4 rounded-xl border p-4 lg:grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_160px_auto] lg:items-center">
            <div>
              <h3 className="font-semibold">{clinic.name}</h3>
              {clinic.isSystemDemo && <span className="text-xs text-muted-foreground">Системная demo-клиника</span>}
            </div>
            <div className="flex gap-2">
              <Input
                value={slugs[clinic.id] ?? clinic.slug}
                aria-label={`Slug клиники ${clinic.name}`}
                disabled={clinic.isSystemDemo}
                onChange={(event) => setSlugs((items) => ({ ...items, [clinic.id]: event.target.value }))}
              />
              <Button type="button" variant="outline" disabled={clinic.isSystemDemo || slugs[clinic.id] === clinic.slug} onClick={() => void updateSlug(clinic)}>Сохранить</Button>
            </div>
            <select
              aria-label={`Статус клиники ${clinic.name}`}
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={clinic.status}
              disabled={clinic.isSystemDemo}
              onChange={(event) => void updateStatus(clinic, event.target.value as ClinicStatus)}
            >
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
              <a className="inline-flex h-8 items-center rounded-lg border px-3 text-sm hover:bg-muted" href={`/${clinic.slug}`} target="_blank" rel="noreferrer">Сайт</a>
              <a className="inline-flex h-8 items-center rounded-lg border px-3 text-sm hover:bg-muted" href={`/${clinic.slug}/admin`} target="_blank" rel="noreferrer">Перейти</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
