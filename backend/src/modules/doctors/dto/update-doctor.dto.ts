import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';
import { DoctorEducationType } from '../types/doctor-education-type.enum.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateDoctorEducationDto {
  @ApiPropertyOptional({ example: 'f0d1c4f3-3d4d-43af-9bb9-4b2e1d6d5a77' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ enum: DoctorEducationType, example: DoctorEducationType.EDUCATION })
  @IsEnum(DoctorEducationType)
  type: DoctorEducationType;

  @ApiProperty({ example: 'Врач-стоматолог' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'МГМУ им. Сеченова' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  year?: number;

  @ApiPropertyOptional({ example: 'Диплом о высшем медицинском образовании' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'Иван' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Иванович' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ example: 'Стоматолог-терапевт' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 2014 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  experienceStartYear?: number;

  @ApiPropertyOptional({ example: 'Опыт работы более 10 лет.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/doctor.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ type: [UpdateDoctorEducationDto], example: [{ type: DoctorEducationType.EDUCATION, title: 'Врач-стоматолог', institution: 'МГМУ им. Сеченова', year: 2015, sortOrder: 0 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDoctorEducationDto)
  educations?: UpdateDoctorEducationDto[];

  @ApiPropertyOptional({ type: [String], example: ['d8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  directionIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['f0d1c4f3-3d4d-43af-9bb9-4b2e1d6d5a77'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];
}