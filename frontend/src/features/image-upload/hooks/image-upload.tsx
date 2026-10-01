"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { cn } from "cn";
import { UploadedImage } from "../types/images.types";


interface ImageUploadProps {
  image: UploadedImage | null;
  alt: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  isUploading?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  error?: string | null;
  accept?: string;
  aspectRatio?: "1/1" | "4/5" | "16/9" | "3/1"
  className?: string;
}

const aspectRatioClasses = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
  "3/1": "aspect-[3/1]",
};

export function ImageUpload({
  image,
  alt,
  onUpload,
  onRemove,
  isUploading = false,
  isDeleting = false,
  disabled = false,
  error = null,
  accept = "image/jpeg,image/png,image/webp",
  aspectRatio = "4/5",
  className
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = isUploading || isDeleting || disabled;
  const imageUrl = getImageUrl(image?.url);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    // Позволяет повторно выбрать тот же файл.
    event.currentTarget.value = "";

    if (!file || isBusy) {
      return;
    }

    await onUpload(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={isBusy}
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={isBusy}
        onClick={() => inputRef.current?.click()}
        aria-label={imageUrl ? "Изменить изображение" : "Загрузить изображение"}
        className={cn(
          "group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-muted/30 transition-colors",
          "hover:bg-muted/50",
          "disabled:cursor-not-allowed disabled:opacity-70",
          aspectRatioClasses[aspectRatio],
          className,
        )}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={alt}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 220px"
              className="object-cover"
            />

            {!isUploading && !isDeleting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col items-center gap-2 text-sm font-medium text-white">
                  <Camera className="size-7" />
                  <span>Изменить фото</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Camera className="size-7" />
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-foreground">
                Загрузить фото
              </p>
              <p className="mt-1 text-xs">
                Нажмите, чтобы выбрать изображение
              </p>
              <p className="mt-4 text-xs">JPG, PNG или WebP, до 5 МБ</p>
            </div>
          </div>
        )}

        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/75 text-sm font-medium">
            <span>
              {isUploading ? "Загрузка фото..." : "Удаление фото..."}
            </span>
          </div>
        )}
      </button>

      {image && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isBusy}
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Удаление..." : "Удалить фото"}
            </Button>
          }
          title="Удалить фото?"
          nativeButton
          confirmText="Удалить"
          confirmButtonVariant="destructive"
          onConfirm={onRemove}
          media={<Trash2 />}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
