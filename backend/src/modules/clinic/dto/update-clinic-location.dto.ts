import {
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClinicLocationDto {
  @ApiPropertyOptional({ example: 'Центральная клиника' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Москва, ул. Ленина, 10' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+7 495 123-45-67', nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'clinic@example.com', nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ example: { monday: '09:00-18:00', sunday: 'closed' }, nullable: true })
  @IsOptional()
  @IsObject()
  workingHours?: Record<string, string> | null;

  @ApiPropertyOptional({ example: 'https://maps.example.com/clinic', nullable: true })
  @IsOptional()
  @IsUrl()
  mapUrl?: string | null;

  @ApiPropertyOptional({ example: 'Принимаем пациентов ежедневно по предварительной записи.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}