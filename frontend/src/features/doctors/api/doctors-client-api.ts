import "client-only";

import { RootApi } from "@/lib/api/root.api";
import apiClient from "@/lib/api/client";
import { UpdateActivityStatusResponse } from "@/shared/types/dto";
import type {
  CreateDoctorRequest,
  Doctor,
  DoctorReferenceOption,
  SkillCreateRequest,
  UpdateDoctorRequest,
} from "../types/doctors.types";

class DoctorClientApi extends RootApi {
  constructor() {
    super(apiClient);
  }

  createDoctor(request: CreateDoctorRequest) {
    return this.requestPost<Doctor, CreateDoctorRequest>("/doctors", request);
  }

  updateDoctor(id: string, request: UpdateDoctorRequest) {
    return this.requestPatch<Doctor, UpdateDoctorRequest>(`/doctors/${id}`, request);
  }

  createSkill(request: SkillCreateRequest) {
    return this.requestPost<DoctorReferenceOption, SkillCreateRequest>("/skills", request);
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
