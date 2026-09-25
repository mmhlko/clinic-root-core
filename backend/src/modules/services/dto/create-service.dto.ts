import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', description: 'ID направления' })
  @IsUUID()
  directionId: string;

  @ApiProperty({ example: 'Лечение кариеса', description: 'Название услуги' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Профессиональное лечение кариеса без боли', description: 'Описание услуги' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2500, description: 'Стоимость услуги' })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: true, description: 'Является ли цена ориентиром' })
  @IsOptional()
  @IsBoolean()
  isPriceFrom?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Порядок сортировки' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}