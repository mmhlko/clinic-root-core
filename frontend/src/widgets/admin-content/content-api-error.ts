import { isAxiosError } from "axios";

export function getContentApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<{ message?: string }>(error)) return fallback;
  return error.response?.data?.message ?? fallback;
}