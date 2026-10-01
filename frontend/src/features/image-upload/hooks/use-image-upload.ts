"use client";

import { mediaClientApi } from "@/features/media/api/media-api";
import { useCallback, useRef, useState } from "react";
import { UploadedImage } from "../types/images.types";

interface UseImageUploadOptions {
  initialImage?: UploadedImage | null;
  maxSize?: number;
  allowedTypes?: string[];
}

interface UseImageUploadReturn {
  image: UploadedImage | null;
  isUploading: boolean;
  isDeleting: boolean;
  error: string | null;
  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;
  cleanup: () => Promise<void>;
  commit: () => void;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export function useImageUpload({
  initialImage = null,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [image, setImage] = useState<UploadedImage | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Исходное изображение уже прикреплено к сущности.
  // Его нельзя удалять до успешного сохранения формы.
  const originalImageIdRef = useRef(initialImage?.id ?? null);

  // Храним ID временного изображения, загруженного в этой форме.
  const temporaryImageIdRef = useRef<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return "Недопустимый формат изображения.";
      }

      if (file.size > maxSize) {
        return `Размер изображения не должен превышать ${Math.round(
          maxSize / 1024 / 1024,
        )} МБ.`;
      }

      return null;
    },
    [allowedTypes, maxSize],
  );

  const upload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const uploaded = await mediaClientApi.uploadImage(file);

        const previousTemporaryId = temporaryImageIdRef.current;

        temporaryImageIdRef.current = uploaded.id;

        setImage({
          id: uploaded.id,
          url: uploaded.url,
        });

        // Удаляем предыдущую временную загрузку,
        // но никогда не удаляем исходное изображение.
        if (
          previousTemporaryId &&
          previousTemporaryId !== uploaded.id &&
          previousTemporaryId !== originalImageIdRef.current
        ) {
          try {
            await mediaClientApi.deleteMedia(previousTemporaryId);
          } catch (deleteError) {
            console.error(
              "Не удалось удалить предыдущее временное изображение:",
              deleteError,
            );
          }
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Не удалось загрузить изображение.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile],
  );

  const remove = useCallback(async () => {
    const currentImage = image;

    if (!currentImage) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const isTemporary =
        currentImage.id !== originalImageIdRef.current;

      if (isTemporary) {
        await mediaClientApi.deleteMedia(currentImage.id);
        temporaryImageIdRef.current = null;
      }

      setImage(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Не удалось удалить изображение.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [image]);

  const cleanup = useCallback(async () => {
    const temporaryId = temporaryImageIdRef.current;

    if (!temporaryId) {
      return;
    }

    // Сбрасываем ID до запроса, чтобы избежать повторного удаления.
    temporaryImageIdRef.current = null;

    try {
      await mediaClientApi.deleteMedia(temporaryId);
    } catch (deleteError) {
      console.error(
        "Не удалось удалить временное изображение:",
        deleteError,
      );
    }
  }, []);

  const commit = useCallback(() => {
    originalImageIdRef.current = image?.id ?? null;
    temporaryImageIdRef.current = null;
  }, [image]);

  return {
    image,
    isUploading,
    isDeleting,
    error,
    upload,
    remove,
    cleanup,
    commit,
  };
}