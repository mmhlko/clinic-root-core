import "server-only";

import serverApiClient from "@/lib/api/server-client";
import { RootApi } from "@/lib/api/root.api";
import type {
  Doctor,
  DoctorListItem,
  DoctorReferenceOption,
} from "../types/doctors.types";

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

  getDoctorAdmin(id: string, accessToken: string) {
    return this.requestGet<Doctor>(`/doctors/${id}/admin`, { accessToken });
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

export const doctorsServerApi = new DoctorsServerApi();