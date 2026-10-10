"use client";

import { useRef, useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  FileJson2Icon,
  RotateCcwIcon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { contentClientApi, type ClinicImportPreview, type ClinicImportResult } from "@/features/content/api/content-client-api";
import type { Clinic } from "@/features/content/types/content.types";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";

type ClinicImportPanelProps = {
  clinicSlug: string;
  onBack: () => void;
  onClinicUpdated: (profile: Partial<Clinic>) => void;
};

const entityLabels: Record<string, string> = {
  clinic: "Поля клиники",
  locations: "Филиалы",
  socialLinks: "Соцсети",
  statistics: "Показатели",
  features: "Преимущества",
  directions: "Направления",
  services: "Услуги",
  doctors: "Врачи",
  reviews: "Отзывы",
  promotions: "Акции",
  documents: "Документы",
  faq: "Вопросы и ответы",
};

function readError(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { errors?: unknown } } }).response;
    const errors = response?.data?.errors;
    if (Array.isArray(errors)) {
      const messages = errors.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const { path, message } = item as { path?: unknown; message?: unknown };
        return typeof message === "string" ? [`${typeof path === "string" ? `${path}: ` : ""}${message}`] : [];
      });
      if (messages.length) return messages.join("\n");
    }
  }
  return getContentApiErrorMessage(error, "Не удалось обработать импорт. Проверьте JSON и повторите попытку.");
}

export function ClinicImportPanel({ clinicSlug, onBack, onClinicUpdated }: ClinicImportPanelProps) {
  const [json, setJson] = useState("");
  const [payload, setPayload] = useState<unknown>(null);
  const [preview, setPreview] = useState<ClinicImportPreview | null>(null);
  const [result, setResult] = useState<ClinicImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"check" | "import" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLocaleLowerCase().endsWith(".json")) {
      setError("Выберите файл с расширением .json.");
      return;
    }
    try {
      const contents = await file.text();
      setJson(contents);
      setFileName(file.name);
      setPayload(null);
      setPreview(null);
      setResult(null);
      setError(null);
    } catch {
      setError("Не удалось прочитать файл. Выберите JSON-файл ещё раз.");
    }
  }

  async function checkJson() {
    setError(null);
    setPreview(null);
    setResult(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Не удалось прочитать JSON. Проверьте скобки, кавычки и запятые.");
      return;
    }
    setBusy("check");
    try {
      const checked = await contentClientApi.previewClinicImport(parsed, clinicSlug);
      if (checked.clinicSlug !== clinicSlug) {
        throw new Error("Ответ сервера относится к другой клинике. Обновите страницу и повторите попытку.");
      }
      setPayload(parsed);
      setPreview(checked);
    } catch (cause) {
      console.log(333, cause);
      
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  }

  async function runImport() {
    if (!payload || !preview || preview.clinicSlug !== clinicSlug) return;
    setError(null);
    setBusy("import");
    try {
      const imported = await contentClientApi.runClinicImport(payload, clinicSlug);
      if (imported.clinicSlug !== clinicSlug) {
        throw new Error("Импорт выполнен для другой клиники. Обратитесь к администратору платформы.");
      }
      if (payload && typeof payload === "object" && "clinic" in payload && payload.clinic && typeof payload.clinic === "object") {
        onClinicUpdated(payload.clinic as Partial<Clinic>);
      }
      setResult(imported);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  }

  const hasEntries = preview && Object.values(preview.entities).some((count) => count > 0);

  return (
    <section className="flex min-h-full flex-col gap-4" aria-labelledby="clinic-import-title">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={busy !== null}>
          <ArrowLeftIcon data-icon="inline-start" />
          К клинике
        </Button>
        <Badge variant="secondary">/{clinicSlug}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle id="clinic-import-title" className="flex items-center gap-2">
            <FileJson2Icon /> Импорт данных
          </CardTitle>
          <CardDescription>
            Вставьте JSON по схеме v1. Найденные записи будут добавлены или обновлены; записи, которых нет в JSON, сохранятся.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="clinic-import-file">JSON-файл</FieldLabel>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="clinic-import-file"
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={(event) => void handleFileChange(event)}
                  disabled={busy !== null || result !== null}
                  tabIndex={-1}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy !== null || result !== null}
                  aria-describedby="clinic-import-file-description"
                >
                  <UploadIcon data-icon="inline-start" />
                  Выбрать файл
                </Button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                  {fileName ?? "Или вставьте JSON ниже"}
                </span>
              </div>
              <FieldDescription id="clinic-import-file-description">
                Файл прочитается в браузере и подставится в поле ниже. Затем нажмите «Проверить JSON».
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="clinic-import-json">JSON клиники</FieldLabel>
              <Textarea
                id="clinic-import-json"
                value={json}
                onChange={(event) => {
                  setJson(event.target.value);
                  setFileName(null);
                  setPayload(null);
                  setPreview(null);
                  setResult(null);
                }}
                placeholder={'{\n  "schemaVersion": 1,\n  "clinic": {\n    "name": "Название клиники"\n  }\n}'}
                className="h-[35dvh] min-h-40 max-h-[50dvh] resize-none font-mono text-xs"
                aria-invalid={Boolean(error)}
                disabled={busy !== null || result !== null}
                spellCheck={false}
              />
              <FieldDescription>JSON отправляется выбранной клинике и не сохраняется как отдельное поле в карточке.</FieldDescription>
            </Field>
          </FieldGroup>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <CircleAlertIcon />
              <AlertTitle>Не удалось продолжить</AlertTitle>
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {preview && !result && (
        <Card>
          <CardHeader>
            <CardTitle>Проверка пройдена</CardTitle>
            <CardDescription>Клиника назначения: /{preview.clinicSlug}. Сводка рассчитана по текущим данным.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([['created', 'Будет добавлено'], ['updated', 'Будет обновлено']] as const).map(([key, title]) => (
                <div key={key} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{title}</p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    {Object.entries(preview.changes[key]).length === 0 ? <li>Нет изменений</li> : Object.entries(preview.changes[key]).map(([name, count]) => (
                      <li key={name} className="flex justify-between gap-2"><span>{entityLabels[name] ?? name}</span><Badge variant="outline">{count}</Badge></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {preview.entities.mediaDownloads > 0 && <p className="text-sm text-muted-foreground">Медиафайлов будет скачано: {preview.entities.mediaDownloads}</p>}
            <p className="text-sm text-muted-foreground">
              В импорт входят только записи из JSON. Остальные записи клиники сохранятся.
            </p>
            <Button type="button" onClick={() => void runImport()} disabled={!hasEntries || busy !== null}>
              {busy === "import" ? <><Spinner data-icon="inline-start" />Импортирование…</> : "Импортировать и обновить"}
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2Icon /> Импорт завершён</CardTitle>
            <CardDescription>Данные обработаны для клиники /{result.clinicSlug}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Скачано медиафайлов: {result.mediaDownloaded}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([['created', 'Добавлено'], ['updated', 'Обновлено']] as const).map(([key, title]) => (
                <div key={key} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{title}</p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    {Object.entries(result[key]).length === 0 ? <li>Нет изменений</li> : Object.entries(result[key]).map(([name, count]) => (
                      <li key={name} className="flex justify-between gap-2"><span>{entityLabels[name] ?? name}</span><span>{count}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={() => { setResult(null); setPreview(null); setPayload(null); setJson(""); }}>
              <RotateCcwIcon data-icon="inline-start" /> Новый импорт
            </Button>
          </CardContent>
        </Card>
      )}

      {!preview && !result && (
        <div className="sticky bottom-0 mt-auto -mx-4 -mb-4 border-t bg-background p-4">
          <Button type="button" onClick={() => void checkJson()} disabled={!json.trim() || busy !== null} className="w-full">
          {busy === "check" ? <><Spinner data-icon="inline-start" />Проверяем JSON…</> : "Проверить JSON"}
          </Button>
        </div>
      )}
    </section>
  );
}
