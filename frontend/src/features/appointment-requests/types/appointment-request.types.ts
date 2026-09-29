import { EStatusVariant } from "@/shared/types/admin";

export interface AppointmentRequestRelation {
  id: string;
  name: string;
}

export interface AppointmentRequestDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

export interface AppointmentRequest {
  id: string;
  name: string;
  phone: string;
  serviceId: string | null;
  doctorId: string | null;
  comment: string | null;
  status: EStatusVariant;
  createdAt: string;
  updatedAt: string;
  service: AppointmentRequestRelation | null;
  doctor: AppointmentRequestDoctor | null;
}

export interface UpdateAppointmentRequestDto {
  name?: string;
  phone?: string;
  serviceId?: string | null;
  doctorId?: string | null;
  comment?: string | null;
}

export interface UpdateAppointmentRequestStatusDto {
  status: EStatusVariant;
}
