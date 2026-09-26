import "server-only";

import { cache } from "react";

import { RootApi } from "@/lib/api/root.api";
import serverApiClient from "@/lib/api/server-client";
import type { AuthUser } from "../types/auth.types";

export interface AdminServerSession {
  user: AuthUser;
  accessToken: string;
}

class AuthServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }

  getSession(refreshToken: string) {
    return this.requestGet<AdminServerSession>("/auth/session", {
      cookie: `refreshToken=${refreshToken}`,
    });
  }
}

export const authServerApi = new AuthServerApi();
const requestAdminSession = cache((refreshToken: string) =>
  authServerApi.getSession(refreshToken),
);

export function getAdminSession(refreshToken: string) {
  return requestAdminSession(refreshToken);
}
