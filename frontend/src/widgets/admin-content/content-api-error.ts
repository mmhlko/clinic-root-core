import { isAxiosError } from "axios";

export function getContentApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<{ message?: string | string[] }>(error)) return fallback;

  const message = error.response?.data?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim()),
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return fallback;
}