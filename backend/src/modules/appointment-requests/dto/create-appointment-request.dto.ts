import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentRequestDto {
  @ApiProperty({ example: 'Анна Петрова' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 900 123-45-67' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'Удобное время для звонка: после 17:00' })
  @IsOptional()
  @IsString()
  comment?: string;
}