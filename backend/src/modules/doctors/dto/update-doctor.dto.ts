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


export class UpdateDoctorEducationDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(DoctorEducationType)
  type: DoctorEducationType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  year?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateDoctorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  experienceStartYear?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDoctorEducationDto)
  educations?: UpdateDoctorEducationDto[];
}