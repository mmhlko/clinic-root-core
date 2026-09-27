import "server-only";

import serverApiClient from "@/lib/api/server-client";
import { RootApi } from "@/lib/api/root.api";
import { DoctorListItem } from "../types/doctors.types";

class DoctorsServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }

  getDoctorListPublic(accessToken: string) {
    return this.requestGet<DoctorListItem[]>("/doctors", { accessToken });
  }

  getDoctorListAdmin(accessToken: string) {
    return this.requestGet<DoctorListItem[]>("/doctors/admin", { accessToken });
  }
}

export const doctorsServerApi = new DoctorsServerApi();