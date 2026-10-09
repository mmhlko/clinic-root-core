"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function RequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Failed to load appointment requests", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-64 w-full max-w-5xl flex-col items-start justify-center gap-3">
      <h2 className="text-lg font-semibold">Не удалось загрузить заявки</h2>
      <p className="text-sm text-muted-foreground">
        Проверьте соединение и попробуйте ещё раз.
      </p>
      <Button onClick={() => reset()}>Повторить</Button>
    </main>
  );
}
