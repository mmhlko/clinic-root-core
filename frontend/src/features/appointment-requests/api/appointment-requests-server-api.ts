import "server-only";

import { RootApi } from "@/lib/api/root.api";
import serverApiClient from "@/lib/api/server-client";

import type { AppointmentRequest } from "../types/appointment-request.types";

class AppointmentRequestsServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }

  getAll(accessToken: string) {
    return this.requestGet<AppointmentRequest[]>(
      "/appointment-requests",
      { accessToken },
    );
  }

  getById(id: string, accessToken: string) {
    return this.requestGet<AppointmentRequest>(
      `/appointment-requests/${id}`,
      { accessToken },
    );
  }
}

export const appointmentRequestsServerApi = new AppointmentRequestsServerApi();
