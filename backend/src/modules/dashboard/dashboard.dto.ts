import { ApiProperty } from '@nestjs/swagger';

import { AppointmentRequestStatus } from '../appointment-requests/appointment-request-status.enum.js';

export class DashboardOverviewDto {
  @ApiProperty({ example: 12, description: 'Количество активных врачей' })
  doctors!: number;

  @ApiProperty({ example: 24, description: 'Количество активных услуг' })
  services!: number;

  @ApiProperty({ example: 6, description: 'Количество активных направлений' })
  directions!: number;

  @ApiProperty({ example: 186, description: 'Количество опубликованных отзывов' })
  reviews!: number;

  @ApiProperty({ example: 4, description: 'Количество активных акций' })
  promotions!: number;

  @ApiProperty({ example: 8, description: 'Количество активных документов' })
  documents!: number;

  @ApiProperty({ example: 15, description: 'Количество активных FAQ' })
  faqs!: number;
}

export class DashboardAppointmentRequestsDto {
  @ApiProperty({ example: 27 })
  total!: number;

  @ApiProperty({ example: 4 })
  new!: number;

  @ApiProperty({ example: 3 })
  inProgress!: number;

  @ApiProperty({ example: 18 })
  completed!: number;

  @ApiProperty({ example: 2 })
  cancelled!: number;
}

export class DashboardRequestTrendDto {
  @ApiProperty({ example: '2026-09-26', format: 'date' })
  date!: string;

  @ApiProperty({ example: 4, minimum: 0 })
  count!: number;
}

export class DashboardModerationDto {
  @ApiProperty({ example: 2, description: 'Отзывы, ожидающие модерации' })
  pendingReviews!: number;
}

export class DashboardServiceSummaryDto {
  @ApiProperty({ example: 'b7b7050e-404d-433f-aaca-8fb7ce9d9f81' })
  id!: string;

  @ApiProperty({ example: 'Профессиональная чистка' })
  name!: string;
}

export class DashboardDoctorSummaryDto {
  @ApiProperty({ example: 'b7b7050e-404d-433f-aaca-8fb7ce9d9f81' })
  id!: string;

  @ApiProperty({ example: 'Иван' })
  firstName!: string;

  @ApiProperty({ example: 'Петров' })
  lastName!: string;

  @ApiProperty({ example: 'Стоматолог-терапевт' })
  specialization!: string;
}

export class DashboardRecentRequestDto {
  @ApiProperty({ example: 'b7b7050e-404d-433f-aaca-8fb7ce9d9f81' })
  id!: string;

  @ApiProperty({ example: 'Анна Иванова' })
  name!: string;

  @ApiProperty({ example: '+7 900 000-00-00' })
  phone!: string;

  @ApiProperty({ example: 'Перезвонить после 18:00', nullable: true })
  comment!: string | null;

  @ApiProperty({ enum: AppointmentRequestStatus, example: AppointmentRequestStatus.NEW })
  status!: AppointmentRequestStatus;

  @ApiProperty({ example: '2026-09-26T10:30:00.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: DashboardServiceSummaryDto, nullable: true })
  service!: DashboardServiceSummaryDto | null;

  @ApiProperty({ type: DashboardDoctorSummaryDto, nullable: true })
  doctor!: DashboardDoctorSummaryDto | null;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardOverviewDto })
  overview!: DashboardOverviewDto;

  @ApiProperty({ type: DashboardAppointmentRequestsDto })
  appointmentRequests!: DashboardAppointmentRequestsDto;

  @ApiProperty({ type: [DashboardRequestTrendDto], description: 'Количество заявок за каждый из последних 90 дней, включая дни без заявок' })
  requestTrend!: DashboardRequestTrendDto[];

  @ApiProperty({ type: DashboardModerationDto })
  moderation!: DashboardModerationDto;

  @ApiProperty({ type: [DashboardRecentRequestDto] })
  recentRequests!: DashboardRecentRequestDto[];
}
