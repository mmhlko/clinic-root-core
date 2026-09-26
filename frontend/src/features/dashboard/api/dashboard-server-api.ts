import "server-only";

import serverApiClient from "@/lib/api/server-client";
import { RootApi } from "@/lib/api/root.api";

import type {
  DashboardPromotion,
  DashboardResponse,
} from "../types/dashboard.types";

class DashboardApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }

  get(accessToken: string) {
    return this.requestGet<DashboardResponse>("/dashboard", { accessToken });
  }

  getPromotions(accessToken: string) {
    return this.requestGet<DashboardPromotion[]>("/promotions/admin", { accessToken });
  }
}

export const dashboardApi = new DashboardApi();
