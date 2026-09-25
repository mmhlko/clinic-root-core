import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentRequestDto {
  @ApiPropertyOptional({ example: 'Анна Петрова' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: '+7 900 123-45-67' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', nullable: true })
  @IsOptional()
  @IsUUID()
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c', nullable: true })
  @IsOptional()
  @IsUUID()
  doctorId?: string | null;

  @ApiPropertyOptional({ example: 'Удобное время для звонка: после 17:00', nullable: true })
  @IsOptional()
  @IsString()
  comment?: string | null;
}