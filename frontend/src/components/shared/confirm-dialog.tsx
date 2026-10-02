"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, type ReactElement, type ReactNode } from "react";

interface ConfirmDialogProps {
  trigger?: ReactElement;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmButtonVariant?: "link" | "default" | "outline" | "secondary" | "ghost" | "destructive"
  confirmText?: string;
  cancelText?: string;
  media?: ReactNode;
  disabled?: boolean;
  nativeButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  media,
  disabled = false,
  nativeButton = false,
  confirmButtonVariant = "default",
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleConfirm() {
    try {
      await onConfirm();
    } finally {
      handleOpenChange(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <AlertDialogTrigger
          render={trigger}
          disabled={disabled}
          nativeButton={nativeButton}
        />
      )}

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          {media && (
            <AlertDialogMedia
              className={
                confirmButtonVariant === "destructive"
                  ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
                  : undefined
              }
            >
              {media}
            </AlertDialogMedia>
          )}

          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            variant={confirmButtonVariant}
            onClick={() => void handleConfirm()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}