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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoctorEducationType } from '../types/doctor-education-type.enum.js';

export class CreateDoctorEducationDto {
  @ApiProperty({ enum: DoctorEducationType, description: 'Тип образования' })
  @IsEnum(DoctorEducationType)
  type: DoctorEducationType;

  @ApiProperty({ example: 'Врач-стоматолог', description: 'Название образования' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'МГМУ', description: 'Учебное заведение' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 2015, description: 'Год окончания' })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  year?: number;

  @ApiPropertyOptional({ example: 'Описание образования', description: 'Дополнительный текст' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Порядок сортировки' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateDoctorDto {
  @ApiProperty({ example: 'Иван', description: 'Имя врача' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия врача' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Иванович', description: 'Отчество врача' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Стоматолог', description: 'Специализация' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 2014, description: 'Год начала стажа' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  experienceStartYear: number;

  @ApiPropertyOptional({ example: 'Опыт работы 12 лет', description: 'Описание врача' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'Ссылка на фото' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ type: [CreateDoctorEducationDto], description: 'Данные об образовании' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDoctorEducationDto)
  educations?: CreateDoctorEducationDto[];

  @ApiPropertyOptional({ type: [String], example: ['d8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c'], description: 'ID направлений' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  directionIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['f0d1c4f3-3d4d-43af-9bb9-4b2e1d6d5a77'], description: 'ID навыков' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];
}