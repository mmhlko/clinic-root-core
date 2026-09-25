import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1' })
  @IsOptional()
  @IsUUID()
  directionId?: string;

  @ApiPropertyOptional({ example: 'Лечение кариеса' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Лечение кариеса с использованием современных материалов.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2500, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPriceFrom?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}