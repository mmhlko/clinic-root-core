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
import type { ReactElement, ReactNode } from "react";

interface ConfirmDialogProps {
  trigger: ReactElement;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmButtonVariant?: "link" | "default" | "outline" | "secondary" | "ghost" | "destructive"
  confirmText?: string;
  cancelText?: string;
  media?: ReactNode;
  disabled?: boolean;
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
  confirmButtonVariant = "default"
}: ConfirmDialogProps) {

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={trigger}
        disabled={disabled}
        nativeButton={false}
      />

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
            onClick={() => void onConfirm()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}