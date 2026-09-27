import "server-only";

import serverApiClient from "@/lib/api/server-client";
import { RootApi } from "@/lib/api/root.api";
import type { DoctorReferenceOption } from "../types/doctors.types";

class DoctorReferencesServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }

  getDirections(accessToken: string) {
    return this.requestGet<DoctorReferenceOption[]>("/service-directions/admin", {
      accessToken,
    });
  }

  getSkills(accessToken: string) {
    return this.requestGet<DoctorReferenceOption[]>("/skills/admin", {
      accessToken,
    });
  }
}

export const doctorReferencesServerApi = new DoctorReferencesServerApi();