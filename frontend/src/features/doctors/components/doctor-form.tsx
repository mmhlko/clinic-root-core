"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Plus, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { doctorsClientApi } from "../api/doctors-client-api";
import type {
  CreateDoctorEducationRequest,
  CreateDoctorRequest,
  Doctor,
  DoctorEducationType,
  DoctorReferenceOption,
  UpdateDoctorEducationRequest,
  UpdateDoctorRequest,
} from "../types/doctors.types";
import { DoctorEducationType as EducationType } from "../types/doctors.types";
import { DoctorReferenceMultiSelect } from "./doctor-reference-multi-select";

interface DoctorEducationFormValue {
  id?: string;
  type: DoctorEducationType;
  title: string;
  institution: string;
  year: string;
  description: string;
}

interface DoctorFormValues {
  firstName: string;
  lastName: string;
  middleName: string;
  specialization: string;
  experienceStartYear: string;
  description: string;
  photoUrl: string | null;
  isActive: boolean;
  educations: DoctorEducationFormValue[];
  directionIds: string[];
  skillIds: string[];
}

interface DoctorFormProps {
  mode: "create" | "edit";
  directions: DoctorReferenceOption[];
  skills: DoctorReferenceOption[];
  doctor?: Doctor;
}

const EDUCATION_TYPES = [
  {
    value: EducationType.EDUCATION,
    label: "Образование",
  },
  {
    value: EducationType.QUALIFICATION,
    label: "Повышение квалификации",
  },
  {
    value: EducationType.RETRAINING,
    label: "Переподготовка",
  },
  {
    value: EducationType.CERTIFICATION,
    label: "Сертификат",
  },
] satisfies {
  value: DoctorEducationType;
  label: string;
}[];

function toFormValues(
  doctor: Doctor | undefined,
  directions: DoctorReferenceOption[],
  skills: DoctorReferenceOption[],
): DoctorFormValues {
  return {
    firstName: doctor?.firstName ?? "",
    lastName: doctor?.lastName ?? "",
    middleName: doctor?.middleName ?? "",
    specialization: doctor?.specialization ?? "",
    experienceStartYear: doctor ? String(doctor.experienceStartYear) : "",
    description: doctor?.description ?? "",
    photoUrl: doctor?.photoUrl ?? null,
    isActive: doctor?.isActive ?? true,
    educations:
      doctor?.educations.map((education) => ({
        id: education.id,
        type: education.type,
        title: education.title,
        institution: education.institution ?? "",
        year: education.year === null ? "" : String(education.year),
        description: education.description ?? "",
      })) ?? [],
    directionIds:
      doctor?.directions
        .filter((item) =>
          directions.some((direction) => direction.id === item.direction.id),
        )
        .map((item) => item.direction.id) ?? [],
    skillIds:
      doctor?.skills
        .filter((item) => skills.some((skill) => skill.id === item.skill.id))
        .map((item) => item.skill.id) ?? [],
  };
}

function getErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(" ");
    }
    if (message) {
      return message;
    }
  }

  return "Не удалось сохранить данные врача. Проверьте поля и попробуйте ещё раз.";
}

function educationPayload(educations: DoctorEducationFormValue[]) {
  return educations
    .filter((education) => education.title.trim())
    .map((education, sortOrder) => ({
      ...(education.id ? { id: education.id } : {}),
      type: education.type,
      title: education.title.trim(),
      ...(education.institution.trim()
        ? { institution: education.institution.trim() }
        : {}),
      ...(education.year ? { year: Number(education.year) } : {}),
      ...(education.description.trim()
        ? { description: education.description.trim() }
        : {}),
      sortOrder,
    }));
}

export function DoctorForm({
  mode,
  directions,
  skills: initialSkills,
  doctor,
}: DoctorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    toFormValues(doctor, directions, initialSkills),
  );
  const [skills, setSkills] = useState(initialSkills);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingActivity, setIsChangingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageUrl = getImageUrl(values.photoUrl);

  const updateValues = <K extends keyof DoctorFormValues>(
    key: K,
    value: DoctorFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Выберите JPG, PNG или WebP размером до 5 МБ.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await doctorsClientApi.uploadDoctorPhoto(file);
      updateValues("photoUrl", uploaded.url);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleActiveChange = async (checked: boolean) => {
    if (mode === "create" || !doctor) {
      updateValues("isActive", checked);
      return;
    }

    setIsChangingActivity(true);
    setError(null);
    try {
      const result = await doctorsClientApi.updateDoctorStatus(
        doctor.id,
        checked,
      );
      updateValues("isActive", result.isActive);
      router.refresh();
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setIsChangingActivity(false);
    }
  };

  const handleCreateSkill = async (name: string) => {
    const existing = skills.find(
      (skill) => skill.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (existing) {
      return existing;
    }

    const createdSkill = await doctorsClientApi.createSkill({ name });
    setSkills((current) => [...current, createdSkill]);
    return createdSkill;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const common = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      specialization: values.specialization.trim(),
      experienceStartYear: Number(values.experienceStartYear),
      ...(values.description.trim()
        ? { description: values.description.trim() }
        : {}),
      ...(values.photoUrl ? { photoUrl: values.photoUrl } : {}),
      directionIds: values.directionIds,
      skillIds: values.skillIds,
    };

    try {
      if (mode === "create") {
        const educations = values.educations
          .filter((education) => education.title.trim())
          .map(
            (education, sortOrder): CreateDoctorEducationRequest => ({
              type: education.type,
              title: education.title.trim(),
              ...(education.institution.trim()
                ? { institution: education.institution.trim() }
                : {}),
              ...(education.year ? { year: Number(education.year) } : {}),
              ...(education.description.trim()
                ? { description: education.description.trim() }
                : {}),
              sortOrder,
            }),
          );
        const request: CreateDoctorRequest = {
          ...common,
          ...(values.middleName.trim()
            ? { middleName: values.middleName.trim() }
            : {}),
          educations,
          isActive: values.isActive,
        };
        await doctorsClientApi.createDoctor(request);
      } else if (doctor) {
        const request: UpdateDoctorRequest = {
          ...common,
          middleName: values.middleName.trim() || null,
          description: values.description.trim() || null,
          photoUrl: values.photoUrl,
          educations: educationPayload(
            values.educations,
          ) as UpdateDoctorEducationRequest[],
        };
        await doctorsClientApi.updateDoctor(doctor.id, request);
      }

      router.push("/admin/doctors");
      router.refresh();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const addEducation = () => {
    updateValues("educations", [
      ...values.educations,
      {
        type: EducationType.EDUCATION,
        title: "",
        institution: "",
        year: "",
        description: "",
      },
    ]);
  };

  const patchEducation = (
    index: number,
    patch: Partial<DoctorEducationFormValue>,
  ) => {
    updateValues(
      "educations",
      values.educations.map((education, itemIndex) =>
        itemIndex === index ? { ...education, ...patch } : education,
      ),
    );
  };

  return (
    <form
      id="doctor-form"
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-5xl space-y-5"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 text-sm text-muted-foreground">
            <Link href="/admin/doctors" className="hover:text-foreground">
              Врачи
            </Link>
            <span className="px-2">/</span>
            {mode === "create" ? "Новый врач" : "Редактирование"}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Создание врача" : "Редактирование врача"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Заполните основные сведения о специалисте
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/doctors" />}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            form="doctor-form"
            disabled={isSaving || isUploading || isChangingActivity}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">1. Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <Label htmlFor="doctor-photo">Фото специалиста</Label>
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Фото врача"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="size-10" />
                  <span>Фото не загружено</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/75 text-sm font-medium">
                  Загрузка фото...
                </div>
              )}
            </div>
            <Input
              id="doctor-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={isUploading || isSaving}
              className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs"
            />
            {values.photoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-destructive"
                onClick={() => updateValues("photoUrl", null)}
              >
                <Trash2 className="size-4" />
                Удалить фото
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              JPG, PNG или WebP, до 5 МБ
            </p>
          </div>

          <div className="grid content-start gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="doctor-last-name">
                Фамилия <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doctor-last-name"
                value={values.lastName}
                onChange={(event) =>
                  updateValues("lastName", event.target.value)
                }
                required
                autoComplete="family-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-first-name">
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doctor-first-name"
                value={values.firstName}
                onChange={(event) =>
                  updateValues("firstName", event.target.value)
                }
                required
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doctor-middle-name">Отчество</Label>
              <Input
                id="doctor-middle-name"
                value={values.middleName}
                onChange={(event) =>
                  updateValues("middleName", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-specialization">
                Специализация <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doctor-specialization"
                value={values.specialization}
                onChange={(event) =>
                  updateValues("specialization", event.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-career-year">
                Год начала практики <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doctor-career-year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={values.experienceStartYear}
                onChange={(event) =>
                  updateValues("experienceStartYear", event.target.value)
                }
                required
              />
              {values.experienceStartYear && (
                <p className="text-xs text-muted-foreground">
                  Стаж:{" "}
                  {Math.max(
                    0,
                    new Date().getFullYear() -
                      Number(values.experienceStartYear),
                  )}{" "}
                  лет
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doctor-description">Описание</Label>
              <Textarea
                id="doctor-description"
                rows={5}
                maxLength={2000}
                value={values.description}
                onChange={(event) =>
                  updateValues("description", event.target.value)
                }
                placeholder="Расскажите об опыте и подходе врача к лечению"
              />
              <p className="text-right text-xs text-muted-foreground">
                {values.description.length}/2000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">2. Образование</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {values.educations.map((education, index) => (
            <fieldset
              key={education.id ?? `new-education-${index}`}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 xl:grid-cols-[1.1fr_1.4fr_1fr_120px_auto]"
            >
              <legend className="sr-only">Образование {index + 1}</legend>
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select
                  value={education.type}
                  onValueChange={(value) => {
                    patchEducation(index, {
                      type: value as DoctorEducationType,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите тип">
                      {(value) =>
                        EDUCATION_TYPES.find((item) => item.value === value)
                          ?.label ?? "Выберите тип"
                      }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Тип образования</SelectLabel>

                      {EDUCATION_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Название образования{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={education.title}
                  onChange={(event) =>
                    patchEducation(index, { title: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Учебное заведение</Label>
                <Input
                  value={education.institution}
                  onChange={(event) =>
                    patchEducation(index, { institution: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Год окончания</Label>
                <Input
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={education.year}
                  onChange={(event) =>
                    patchEducation(index, { year: event.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить образование"
                  className="mb-2 cursor-pointer"
                  onClick={() =>
                    updateValues(
                      "educations",
                      values.educations.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </fieldset>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
          >
            <Plus className="size-4" />
            Добавить образование
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">3. Направления</CardTitle>
          <p className="text-sm text-muted-foreground">
            Выберите направления из списка клиники
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <DoctorReferenceMultiSelect
            options={directions}
            selectedIds={values.directionIds}
            placeholder="Выбрать направление..."
            searchPlaceholder="Найти направление..."
            emptyLabel="Направления не найдены"
            onChange={(ids) => updateValues("directionIds", ids)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">4. Навыки</CardTitle>
          <p className="text-sm text-muted-foreground">
            Выберите из списка или добавьте новый навык
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <DoctorReferenceMultiSelect
            options={skills}
            selectedIds={values.skillIds}
            placeholder="Выберать или добавить навыки..."
            searchPlaceholder="Найти или создать навык..."
            emptyLabel="Совпадений нет — можно добавить новый навык"
            allowCreate
            onChange={(ids) => updateValues("skillIds", ids)}
            onCreate={handleCreateSkill}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">5. Статус</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="doctor-active">Активность врача</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Неактивный врач не отображается на публичном сайте
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {values.isActive ? "Активен" : "Неактивен"}
            </span>
            <Switch
              id="doctor-active"
              checked={values.isActive}
              disabled={isChangingActivity || isSaving}
              onCheckedChange={(checked) => void handleActiveChange(checked)}
            />
          </div>
        </CardContent>
      </Card>

      <footer className="flex justify-between gap-3 border-t py-4">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href="/admin/doctors" />}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          form="doctor-form"
          disabled={isSaving || isUploading || isChangingActivity}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </footer>
    </form>
  );
}
