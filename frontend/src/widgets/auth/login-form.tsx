import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import type { SubmitEvent } from "react";
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isSubmitting: boolean;
  error: string | null;
  className?: string;
}

export function LoginForm({
  className,
  onSubmit,
  isSubmitting,
  error,
}: LoginFormProps) {

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    onSubmit(
      String(formData.get("email") ?? ""),
      String(formData.get("password") ?? ""),
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@clinic.ru"
                  autoComplete="username"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              {error && <p role="alert">{error}</p>}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Входим..." : "Войти"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}