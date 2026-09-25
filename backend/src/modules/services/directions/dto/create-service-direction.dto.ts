import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDirectionDto {
  @ApiProperty({ example: 'Терапия' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Диагностика и лечение заболеваний зубов.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}