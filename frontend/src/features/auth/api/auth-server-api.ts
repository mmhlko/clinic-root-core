import axios from "axios";

import type { AuthUser } from "../types/auth.types";

const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3001";

export async function getAdminSession(refreshToken: string): Promise<AuthUser> {
  const { data } = await axios.get<AuthUser>(`${backendUrl}/auth/session`, {
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
    timeout: 15_000,
  });

  return data;
}
