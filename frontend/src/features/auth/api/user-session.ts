import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { authServerApi } from "@/features/auth/api/auth-server-api";

export const getUserSession = cache(async () => {
  const refreshToken = (await cookies()).get("refreshToken")?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    return await authServerApi.fetchSession(refreshToken);
  } catch {
    return null;
  }
});