import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import { AppointmentRequestStatus } from '../appointment-request-status.enum.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentRequestStatusDto {
  @ApiProperty({ enum: AppointmentRequestStatus, example: AppointmentRequestStatus.IN_PROGRESS })
  @IsEnum(AppointmentRequestStatus)
  @IsNotEmpty()
  status: AppointmentRequestStatus;
}