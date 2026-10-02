"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toast";
import { useAuth } from "../providers/auth-provider";
import { LoginForm } from "@/widgets/auth/login-form";

export function AuthForm() {
  const { login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (email: string, password: string) => {
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch {
      toast.add({
        type: "error",
        description: "Неверный email или пароль",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}