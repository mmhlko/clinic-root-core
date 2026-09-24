import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import { AppointmentRequestStatus } from '../appointment-request-status.enum.js';

export class UpdateAppointmentRequestStatusDto {
  @IsEnum(AppointmentRequestStatus)
  @IsNotEmpty()
  status: AppointmentRequestStatus;
}