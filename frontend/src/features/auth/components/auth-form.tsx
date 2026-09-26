"use client";

import { useState } from "react";

import { useAuth } from "../providers/auth-provider";
import { LoginForm } from "@/components/login-form";

export function AuthForm() {
  const { login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}