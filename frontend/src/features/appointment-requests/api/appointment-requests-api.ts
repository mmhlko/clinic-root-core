"use client";

import { RootApi } from "@/lib/api/root.api";
import apiClient from "@/lib/api/client";

import type {
  AppointmentRequest,
  UpdateAppointmentRequestDto,
  UpdateAppointmentRequestStatusDto,
} from "../types/appointment-request.types";

class AppointmentRequestsApi extends RootApi {
  constructor() {
    super(apiClient);
  }

  create(dto: Pick<AppointmentRequest, "name" | "phone"> & Partial<Pick<AppointmentRequest, "serviceId" | "doctorId" | "comment">>) {
    return this.requestPost<AppointmentRequest>("/appointment-requests", dto);
  }

  getAll() {
    return this.requestGet<AppointmentRequest[]>("/appointment-requests");
  }

  getById(id: string) {
    return this.requestGet<AppointmentRequest>(`/appointment-requests/${id}`);
  }

  update(id: string, dto: UpdateAppointmentRequestDto) {
    return this.requestPatch<AppointmentRequest, UpdateAppointmentRequestDto>(
      `/appointment-requests/${id}`,
      dto,
    );
  }

  updateStatus(
    id: string,
    dto: UpdateAppointmentRequestStatusDto,
  ) {
    return this.requestPut<
      AppointmentRequest,
      UpdateAppointmentRequestStatusDto
    >(`/appointment-requests/${id}/status`, dto);
  }

  delete(id: string) {
    return this.requestDelete(`/appointment-requests/${id}`);
  }
}

export const appointmentRequestsApi = new AppointmentRequestsApi();
