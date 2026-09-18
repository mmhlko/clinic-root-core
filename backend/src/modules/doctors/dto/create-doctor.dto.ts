import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { DoctorEducationType } from '../types/doctor-education-type.enum.js';


export class CreateDoctorEducationDto {
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

export class CreateDoctorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  specialization: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  experienceStartYear: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDoctorEducationDto)
  educations?: CreateDoctorEducationDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  directionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];
}