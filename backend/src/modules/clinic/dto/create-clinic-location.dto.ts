import {
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicLocationDto {
  @ApiProperty({ example: 'Центральная клиника' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Москва, ул. Ленина, 10' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: '+7 495 123-45-67' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'clinic@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: { monday: '09:00-18:00', sunday: 'closed' } })
  @IsOptional()
  @IsObject()
  workingHours?: Record<string, string>;

  @ApiPropertyOptional({ example: 'https://maps.example.com/clinic' })
  @IsOptional()
  @IsUrl()
  mapUrl?: string;

  @ApiPropertyOptional({ example: 'Принимаем пациентов ежедневно по предварительной записи.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}