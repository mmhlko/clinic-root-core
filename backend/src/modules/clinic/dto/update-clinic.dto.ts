import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClinicDto {
  @ApiPropertyOptional({ example: 'Клиника Здоровье' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Современная стоматология рядом с вами', nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string | null;

  @ApiPropertyOptional({ example: 'Оказываем полный спектр стоматологических услуг.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'Здоровая улыбка начинается здесь', nullable: true })
  @IsOptional()
  @IsString()
  slogan?: string | null;

  @ApiPropertyOptional({ example: '+7 495 123-45-67', nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'info@clinic.example.com', nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ example: 'ООО Клиника Здоровье', nullable: true })
  @IsOptional()
  @IsString()
  legalName?: string | null;

  @ApiPropertyOptional({ example: 'ЛО-77-01-012345', nullable: true })
  @IsOptional()
  @IsString()
  licenseNumber?: string | null;

  @ApiPropertyOptional({ example: '2024-05-20', nullable: true })
  @IsOptional()
  @IsDateString()
  licenseDate?: string | null;

  @ApiPropertyOptional({ example: '7701234567', nullable: true })
  @IsOptional()
  @IsString()
  inn?: string | null;

  @ApiPropertyOptional({ example: '1247700123456', nullable: true })
  @IsOptional()
  @IsString()
  ogrn?: string | null;
}