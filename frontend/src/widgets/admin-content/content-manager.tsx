"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  AdminUser,
  DocumentItem,
  FaqItem,
  Promotion,
  Review,
  Service,
  ServiceDirection,
  UserRole,
} from "@/features/content/types/content.types";
import { Badge } from "@/components/ui/badge";

type Kind =
  | "directions"
  | "services"
  | "promotions"
  | "reviews"
  | "documents"
  | "faq"
  | "users";
type Props = {
  kind: Kind;
  initialData:
    | ServiceDirection[]
    | Service[]
    | Promotion[]
    | Review[]
    | DocumentItem[]
    | FaqItem[]
    | AdminUser[];
  references?: {
    directions?: ServiceDirection[];
    services?: Service[];
    doctors?: { id: string; firstName: string; lastName: string }[];
    locations?: { id: string; name: string }[];
  };
  currentRole?: UserRole;
};

function ErrorText({ error }: { error: string }) {
  return error ? <p className="text-sm text-destructive">{error}</p> : null;
}
function FormShell({
  children,
  onCancel,
  onSubmit,
  saving,
}: {
  children: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      {children}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          <Save data-icon="inline-start" />
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          <X data-icon="inline-start" />
          Отмена
        </Button>
      </div>
    </form>
  );
}

export function ContentManager({
  kind,
  initialData,
  references = {},
  currentRole,
}: Props) {
  const [data, setData] = useState(initialData as any[]);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      data.filter((item) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return JSON.stringify(item).toLowerCase().includes(q);
      }),
    [data, search],
  );

  const startCreate = () => {
    setError("");
    setEditing(null);
    setCreating(true);
  };
  const cancel = () => {
    setCreating(false);
    setEditing(null);
    setError("");
  };

  async function run(fn: () => Promise<any>) {
    setSaving(true);
    setError("");
    try {
      const result = await fn();
      return result;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Не удалось выполнить операцию.");
    } finally {
      setSaving(false);
    }
  }

  async function saveService(form: FormData) {
    const body = {
      directionId: String(form.get("directionId")),
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      price: form.get("price") ? Number(form.get("price")) : undefined,
      isPriceFrom: form.get("isPriceFrom") === "true",
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const result = await run(() =>
      editing
        ? contentClientApi.updateService(editing.id, body)
        : contentClientApi.createService(body),
    );
    if (result) {
      setData((prev: any[]) =>
        editing
          ? prev.map((x) => (x.id === result.id ? result : x))
          : [result, ...prev],
      );
      cancel();
    }
  }
  async function savePromotion(form: FormData) {
    const body = {
      title: String(form.get("title")),
      description: String(form.get("description") || ""),
      imageUrl: String(form.get("imageUrl") || "") || null,
      oldPrice: form.get("oldPrice") ? Number(form.get("oldPrice")) : null,
      newPrice: form.get("newPrice") ? Number(form.get("newPrice")) : null,
      validFrom: String(form.get("validFrom") || "") || null,
      validTo: String(form.get("validTo") || "") || null,
      serviceId: String(form.get("serviceId") || "") || null,
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const result = await run(() =>
      editing
        ? contentClientApi.updatePromotion(editing.id, body)
        : contentClientApi.createPromotion(body),
    );
    if (result) {
      setData((prev: any[]) =>
        editing
          ? prev.map((x) => (x.id === result.id ? result : x))
          : [result, ...prev],
      );
      cancel();
    }
  }
  async function saveReview(form: FormData) {
    const body = {
      authorName: String(form.get("authorName")),
      text: String(form.get("text")),
      rating: Number(form.get("rating")),
      reviewDate: String(form.get("reviewDate") || "") || null,
      doctorId: String(form.get("doctorId") || "") || null,
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const result = await run(() =>
      contentClientApi.updateReview(editing.id, body),
    );
    if (result) {
      setData((prev: any[]) =>
        prev.map((x) => (x.id === result.id ? result : x)),
      );
      cancel();
    }
  }
  async function saveUser(form: FormData) {
    const body: any = {
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      email: String(form.get("email")),
      role: String(form.get("role")),
      locationId: String(form.get("locationId") || "") || null,
      avatarUrl: String(form.get("avatarUrl") || "") || null,
    };
    const password = String(form.get("password") || "");
    if (password) body.password = password;
    const result = await run(() =>
      editing
        ? contentClientApi.updateUser(editing.id, body)
        : contentClientApi.createUser(body),
    );
    if (result) {
      setData((prev: any[]) =>
        editing
          ? prev.map((x) => (x.id === result.id ? result : x))
          : [result, ...prev],
      );
      cancel();
    }
  }

  async function saveDirection(form: FormData) {
    const body = {
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      sortOrder: Number(form.get("sortOrder") || 0),
    };
    const result = await run(() => contentClientApi.createDirection(body));
    if (result) {
      setData((prev) => [result, ...prev]);
      cancel();
    }
  }
  async function saveDocument(form: FormData) {
    const fd = new FormData();
    fd.append("title", String(form.get("title")));
    fd.append("description", String(form.get("description") || ""));
    fd.append("sortOrder", String(form.get("sortOrder") || 0));
    const file = form.get("file");
    if (file instanceof File && file.size) fd.append("file", file);
    const result = await run(() =>
      editing
        ? contentClientApi.updateDocument(editing.id, fd)
        : contentClientApi.createDocument(fd),
    );
    if (result) {
      setData((prev) =>
        editing
          ? prev.map((x) => (x.id === result.id ? result : x))
          : [result, ...prev],
      );
      cancel();
    }
  }

  async function toggle(item: any, next: boolean) {
    const old = [...data];
    setData(data.map((x) => (x.id === item.id ? { ...x, isActive: next } : x)));
    try {
      let result;
      if (kind === "services")
        result = await contentClientApi.setServiceActive(item.id, next);
      if (kind === "promotions")
        result = await contentClientApi.setPromotionActive(item.id, next);
      if (kind === "reviews")
        result = await contentClientApi.setReviewActive(item.id, next);
      if (kind === "documents")
        result = await contentClientApi.setDocumentActive(item.id, next);
      if (kind === "users")
        result = await contentClientApi.setUserActive(item.id, next);
      if (kind === "directions") return;
      if (result)
        setData((prev) => prev.map((x) => (x.id === item.id ? result : x)));
    } catch (e: any) {
      setData(old);
      setError(e?.response?.data?.message ?? "Не удалось изменить статус.");
    }
  }

  async function reviewAction(item: any, action: "publish" | "reject") {
    const result = await run(() =>
      action === "publish"
        ? contentClientApi.publishReview(item.id)
        : contentClientApi.rejectReview(item.id),
    );
    if (result)
      setData((prev) => prev.map((x) => (x.id === result.id ? result : x)));
  }

  async function remove(item: any) {
    const result = await run(async () => {
      if (kind === "promotions")
        return contentClientApi.deletePromotion(item.id);
      if (kind === "reviews") return contentClientApi.deleteReview(item.id);
      if (kind === "documents") return contentClientApi.deleteDocument(item.id);
      throw new Error("Удаление для этого раздела не предусмотрено API");
    });
    if (result) setData((prev) => prev.filter((x) => x.id !== item.id));
  }

  const title = {
    directions: "Направления",
    services: "Услуги",
    promotions: "Акции",
    reviews: "Отзывы",
    documents: "Документы",
    faq: "FAQ",
    users: "Пользователи",
  }[kind];
  const canCreate = kind !== "reviews" && kind !== "faq";
  const showSearch = kind !== "faq";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showSearch ? (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Поиск: ${title.toLowerCase()}…`}
            className="sm:max-w-sm"
          />
        ) : (
          <div />
        )}
        {canCreate && (
          <Button onClick={startCreate}>
            <Plus data-icon="inline-start" />
            Добавить
          </Button>
        )}
      </div>
      <ErrorText error={error} />
      {creating && kind === "directions" && (
        <DirectionForm
          saving={saving}
          onCancel={cancel}
          onSave={saveDirection}
        />
      )}
      {creating && kind === "services" && (
        <ServiceForm
          item={null}
          refs={references}
          saving={saving}
          onCancel={cancel}
          onSave={saveService}
        />
      )}
      {creating && kind === "promotions" && (
        <PromotionForm
          item={null}
          refs={references}
          saving={saving}
          onCancel={cancel}
          onSave={savePromotion}
        />
      )}
      {creating && kind === "documents" && (
        <DocumentForm
          item={null}
          saving={saving}
          onCancel={cancel}
          onSave={saveDocument}
        />
      )}
      {creating && kind === "users" && (
        <UserForm
          item={null}
          refs={references}
          role={currentRole}
          saving={saving}
          onCancel={cancel}
          onSave={saveUser}
        />
      )}
      {editing && kind === "services" && (
        <ServiceForm
          item={editing}
          refs={references}
          saving={saving}
          onCancel={cancel}
          onSave={saveService}
        />
      )}
      {editing && kind === "promotions" && (
        <PromotionForm
          item={editing}
          refs={references}
          saving={saving}
          onCancel={cancel}
          onSave={savePromotion}
        />
      )}
      {editing && kind === "reviews" && (
        <ReviewForm
          item={editing}
          refs={references}
          saving={saving}
          onCancel={cancel}
          onSave={saveReview}
        />
      )}
      {editing && kind === "documents" && (
        <DocumentForm
          item={editing}
          saving={saving}
          onCancel={cancel}
          onSave={saveDocument}
        />
      )}
      {editing && kind === "users" && (
        <UserForm
          item={editing}
          refs={references}
          role={currentRole}
          saving={saving}
          onCancel={cancel}
          onSave={saveUser}
        />
      )}
      {kind === "faq" ? (
        <FaqEditor
          initial={data as FaqItem[]}
          onSaved={setData}
          setError={setError}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              Ничего не найдено.
            </div>
          ) : (
            filtered.map((item: any) => (
              <div key={item.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">
                        {kind === "users"
                          ? `${item.lastName} ${item.firstName}`
                          : kind === "reviews"
                            ? item.authorName
                            : kind === "documents"
                              ? item.title
                              : item.name || item.title}
                      </h3>
                      {kind === "reviews" && (
                        <Badge variant="outline">{item.status}</Badge>
                      )}
                      {"isActive" in item && (
                        <Badge variant="outline">
                          {item.isActive ? "Активна" : "Скрыта"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {kind === "services"
                        ? `${item.direction?.name ?? "Без направления"} · ${item.price != null ? `${item.price} ₽` : "Цена не указана"}`
                        : kind === "promotions"
                          ? `${item.newPrice != null ? `${item.newPrice} ₽` : "Цена не указана"} · ${item.service?.name ?? "Без услуги"}`
                          : kind === "reviews"
                            ? `${"★".repeat(item.rating)} · ${item.doctor ? `${item.doctor.lastName} ${item.doctor.firstName}` : "Без врача"}`
                            : kind === "documents"
                              ? `${item.fileName} · ${item.fileType}`
                              : kind === "users"
                                ? `${item.email} · ${item.role}`
                                : kind === "directions"
                                  ? item.description || "Без описания"
                                  : ""}
                    </p>
                    {kind === "reviews" && (
                      <p className="whitespace-pre-wrap text-sm">{item.text}</p>
                    )}
                    {kind === "promotions" && (
                      <p className="whitespace-pre-wrap text-sm">
                        {item.description}
                      </p>
                    )}
                    {kind === "documents" && (
                      <a
                        className="text-sm underline"
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть файл
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {"isActive" in item && kind !== "directions" && (
                      <Switch
                        disabled={
                          kind === "reviews" && item.status !== "published"
                        }
                        checked={item.isActive}
                        onCheckedChange={(v) => void toggle(item, v)}
                        aria-label="Активность"
                      />
                    )}
                    {kind === "reviews" && item.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => void reviewAction(item, "publish")}
                        >
                          <Check data-icon="inline-start" />
                          Опубликовать
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void reviewAction(item, "reject")}
                        >
                          <X data-icon="inline-start" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {(kind === "services" ||
                      kind === "promotions" ||
                      kind === "reviews" ||
                      kind === "documents" ||
                      kind === "users") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(item);
                          setCreating(false);
                        }}
                      >
                        <Pencil data-icon="inline-start" />
                        Изменить
                      </Button>
                    )}
                    {(kind === "promotions" ||
                      kind === "reviews" ||
                      kind === "documents") && (
                      <ConfirmAction
                        label="Удалить"
                        onConfirm={() => void remove(item)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea id={name} name={name} defaultValue={defaultValue} />
      ) : (
        <Input id={name} name={name} type={type} defaultValue={defaultValue} />
      )}
    </div>
  );
}
function FormActions({
  onCancel,
  saving,
}: {
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={saving}>
        <Save data-icon="inline-start" />
        {saving ? "Сохранение…" : "Сохранить"}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Отмена
      </Button>
    </div>
  );
}
function ServiceForm({
  item,
  refs,
  saving,
  onCancel,
  onSave,
}: {
  item: any;
  refs: any;
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Название" name="name" defaultValue={item?.name} />
        <div className="space-y-2">
          <Label>Направление</Label>
          <select
            name="directionId"
            defaultValue={item?.directionId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Выберите направление</option>
            {(refs.directions ?? []).map((x: any) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field
        label="Описание"
        name="description"
        defaultValue={item?.description ?? ""}
        textarea
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Цена"
          name="price"
          type="number"
          defaultValue={item?.price ?? ""}
        />
        <div className="space-y-2">
          <Label>Цена от</Label>
          <select
            name="isPriceFrom"
            defaultValue={String(item?.isPriceFrom ?? false)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="false">Нет</option>
            <option value="true">Да</option>
          </select>
        </div>
        <Field
          label="Сортировка"
          name="sortOrder"
          type="number"
          defaultValue={item?.sortOrder ?? 0}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function PromotionForm({
  item,
  refs,
  saving,
  onCancel,
  onSave,
}: {
  item: any;
  refs: any;
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <Field label="Название" name="title" defaultValue={item?.title} />
      <Field
        label="Описание"
        name="description"
        defaultValue={item?.description ?? ""}
        textarea
      />
      <Field
        label="URL изображения"
        name="imageUrl"
        defaultValue={item?.imageUrl ?? ""}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Старая цена"
          name="oldPrice"
          type="number"
          defaultValue={item?.oldPrice ?? ""}
        />
        <Field
          label="Новая цена"
          name="newPrice"
          type="number"
          defaultValue={item?.newPrice ?? ""}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Начало"
          name="validFrom"
          type="datetime-local"
          defaultValue={
            item?.validFrom
              ? new Date(item.validFrom).toISOString().slice(0, 16)
              : ""
          }
        />
        <Field
          label="Окончание"
          name="validTo"
          type="datetime-local"
          defaultValue={
            item?.validTo
              ? new Date(item.validTo).toISOString().slice(0, 16)
              : ""
          }
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Услуга</Label>
          <select
            name="serviceId"
            defaultValue={item?.serviceId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Без услуги</option>
            {(refs.services ?? []).map((x: any) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Сортировка"
          name="sortOrder"
          type="number"
          defaultValue={item?.sortOrder ?? 0}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function ReviewForm({
  item,
  refs,
  saving,
  onCancel,
  onSave,
}: {
  item: any;
  refs: any;
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <Field label="Автор" name="authorName" defaultValue={item?.authorName} />
      <Field label="Текст" name="text" defaultValue={item?.text} textarea />
      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Оценка 1–5"
          name="rating"
          type="number"
          defaultValue={item?.rating ?? 5}
        />
        <Field
          label="Дата"
          name="reviewDate"
          type="date"
          defaultValue={
            item?.reviewDate
              ? new Date(item.reviewDate).toISOString().slice(0, 10)
              : ""
          }
        />
        <div className="space-y-2">
          <Label>Врач</Label>
          <select
            name="doctorId"
            defaultValue={item?.doctorId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Без врача</option>
            {(refs.doctors ?? []).map((x: any) => (
              <option key={x.id} value={x.id}>
                {x.lastName} {x.firstName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field
        label="Сортировка"
        name="sortOrder"
        type="number"
        defaultValue={item?.sortOrder ?? 0}
      />
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function DocumentForm({
  item,
  saving,
  onCancel,
  onSave,
}: {
  item: any;
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <Field label="Название" name="title" defaultValue={item?.title} />
      <Field
        label="Описание"
        name="description"
        defaultValue={item?.description ?? ""}
        textarea
      />
      <Field
        label="Сортировка"
        name="sortOrder"
        type="number"
        defaultValue={item?.sortOrder ?? 0}
      />
      <div className="space-y-2">
        <Label>Файл {item ? "(необязательно при редактировании)" : ""}</Label>
        <Input
          name="file"
          type="file"
          accept=".pdf,.doc,.docx"
          required={!item}
        />
      </div>
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function UserForm({
  item,
  refs,
  role,
  saving,
  onCancel,
  onSave,
}: {
  item: any;
  refs: any;
  role?: UserRole;
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Имя" name="firstName" defaultValue={item?.firstName} />
        <Field label="Фамилия" name="lastName" defaultValue={item?.lastName} />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={item?.email}
      />
      <Field
        label={item ? "Новый пароль (необязательно)" : "Пароль"}
        name="password"
        type="password"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Роль</Label>
          <select
            name="role"
            defaultValue={item?.role ?? "manager"}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            {(role === "root" || !role) && <option value="admin">Admin</option>}
            <option value="manager">Manager</option>
            {role === "root" && item?.role === "root" && (
              <option value="root">Root</option>
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Филиал для Manager</Label>
          <select
            name="locationId"
            defaultValue={item?.locationId ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Не указан</option>
            {(refs.locations ?? []).map((x: any) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field
        label="URL аватара"
        name="avatarUrl"
        defaultValue={item?.avatarUrl ?? ""}
      />
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function DirectionForm({
  saving,
  onCancel,
  onSave,
}: {
  saving: boolean;
  onCancel: () => void;
  onSave: (f: FormData) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <Field name="name" label="Название" />
      <Field name="description" label="Описание" textarea />
      <Field
        name="sortOrder"
        label="Сортировка"
        type="number"
        defaultValue="0"
      />
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
function ConfirmAction({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="destructive" />}>
        <Trash2 data-icon="inline-start" />
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить запись?</DialogTitle>
          <DialogDescription>
            Действие нельзя отменить. Запись будет удалена с сервера.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger render={<Button variant="outline" />}>
            Отмена
          </DialogTrigger>
          <DialogTrigger
            render={<Button variant="destructive" />}
            onClick={onConfirm}
          >
            Удалить
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function FaqEditor({
  initial,
  onSaved,
  setError,
}: {
  initial: FaqItem[];
  onSaved: (x: FaqItem[]) => void;
  setError: (x: string) => void;
}) {
  const [items, setItems] = useState<FaqItem[]>(initial);
  const [saving, setSaving] = useState(false);
  const add = () =>
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        question: "",
        answer: "",
        sortOrder: items.length,
        isActive: true,
      },
    ]);
  const update = (id: string, key: keyof FaqItem, value: any) =>
    setItems(items.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const remove = (id: string) =>
    setItems(
      items.filter((x) => x.id !== id).map((x, i) => ({ ...x, sortOrder: i })),
    );
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = items.map(({ id, ...x }) =>
        id.startsWith("new-") ? x : { id, ...x },
      );
      const result = await contentClientApi.saveFaq(payload as any);
      onSaved(result);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Не удалось сохранить FAQ.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button onClick={add}>
          <Plus data-icon="inline-start" />
          Добавить вопрос
        </Button>
        <Button variant="outline" onClick={() => void save()} disabled={saving}>
          <Save data-icon="inline-start" />
          {saving ? "Сохранение…" : "Сохранить всё"}
        </Button>
      </div>
      {items.map((x) => (
        <div key={x.id} className="grid gap-3 rounded-xl border bg-card p-4">
          <Input
            value={x.question}
            onChange={(e) => update(x.id, "question", e.target.value)}
            placeholder="Вопрос"
          />
          <Textarea
            value={x.answer}
            onChange={(e) => update(x.id, "answer", e.target.value)}
            placeholder="Ответ"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Input
                className="w-24"
                type="number"
                value={x.sortOrder}
                onChange={(e) =>
                  update(x.id, "sortOrder", Number(e.target.value))
                }
              />
              <Switch
                checked={x.isActive}
                onCheckedChange={(v) => update(x.id, "isActive", v)}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => remove(x.id)}
            >
              <Trash2 data-icon="inline-start" />
              Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
