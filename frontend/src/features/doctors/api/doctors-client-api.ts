import "client-only";

import { RootApi } from "@/lib/api/root.api";
import { Doctor } from "../types/doctors.types";
import apiClient from "@/lib/api/client";
import { UpdateActivityStatusResponse } from "@/shared/types/dto";

class DoctorClientApi extends RootApi {
    constructor() {
    super(apiClient);
  }

  updateDoctorStatus(id: string, isActive: boolean) {
    return this.requestPut<UpdateActivityStatusResponse>(`/doctors/${id}/active`, {
      isActive,
    })
  }

  reorderDoctors(doctorIds: string[]) {
    return this.requestPatch('/doctors/reorder', {
      doctorIds
    })
  }

  deleteDoctor(id: string) {
    return this.requestDelete(`/doctors/${id}`)
  }
}

export const doctorsClientApi = new DoctorClientApi();
