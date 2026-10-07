"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";

interface UserPasswordResetProps {
  resetting: boolean;
  onReset: (password: string) => void | Promise<void>;
}

export function UserPasswordReset({
  resetting,
  onReset,
}: UserPasswordResetProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmNewPassword") ?? "");

    if (newPassword !== confirmPassword) {
      toast.add({
        type: "error",
        description: "Введенные пароли не совпадают",
      });

      return;
    }

    // Сохраняем пароль только после успешной проверки
    setPassword(newPassword);

    // Теперь открываем подтверждение
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    await onReset(password);

    setConfirmOpen(false);
    setOpen(false);
    setPassword("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Безопасность</CardTitle>
      </CardHeader>

      <CardContent>
        {!open ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Пароль пользователя</p>
              <p className="text-sm text-muted-foreground">
                Задайте новый пароль для пользователя.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              Сбросить пароль
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="font-medium">Новый пароль</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Укажите новый пароль и подтвердите его.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-user-password" required>
                  Новый пароль
                </Label>

                <Input
                  id="new-user-password"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={resetting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-user-password" required>
                  Повторите пароль
                </Label>

                <Input
                  id="confirm-user-password"
                  name="confirmNewPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={resetting}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={resetting}
              >
                Отмена
              </Button>

              <Button type="submit" disabled={resetting}>
                {resetting ? "Сохранение…" : "Сохранить пароль"}
              </Button>
            </div>
          </form>
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Сбросить пароль?"
          description="Откатить это действие не получится."
          confirmText="Сбросить"
          confirmButtonVariant="default"
          disabled={resetting}
          onConfirm={handleConfirm}
        />
      </CardContent>
    </Card>
  );
}