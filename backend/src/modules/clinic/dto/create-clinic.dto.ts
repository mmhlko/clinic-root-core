import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({ example: 'Клиника Здоровье' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Современная стоматология рядом с вами' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Оказываем полный спектр стоматологических услуг.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Здоровая улыбка начинается здесь' })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({ example: '+7 495 123-45-67' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@clinic.example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'ООО Клиника Здоровье' })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional({ example: 'ЛО-77-01-012345' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '2024-05-20' })
  @IsOptional()
  @IsDateString()
  licenseDate?: string;

  @ApiPropertyOptional({ example: '7701234567' })
  @IsOptional()
  @IsString()
  inn?: string;

  @ApiPropertyOptional({ example: '1247700123456' })
  @IsOptional()
  @IsString()
  ogrn?: string;
}