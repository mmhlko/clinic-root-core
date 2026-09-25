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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicFeatureItemDto {
  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ example: 'Современное оборудование' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Точная диагностика и комфортное лечение.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/equipment.jpg', nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 'tooth', nullable: true })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveClinicFeaturesDto {
  @ApiProperty({ type: [ClinicFeatureItemDto], example: [{ title: 'Современное оборудование', description: 'Точная диагностика и комфортное лечение.', imageUrl: 'https://example.com/equipment.jpg', icon: 'tooth', sortOrder: 0, isActive: true }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicFeatureItemDto)
  features: ClinicFeatureItemDto[];
}