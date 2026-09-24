import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class ClinicFeatureItemDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveClinicFeaturesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicFeatureItemDto)
  features: ClinicFeatureItemDto[];
}