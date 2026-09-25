import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkDto {
  @ApiPropertyOptional({ example: 'Восстановление улыбки' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Результат лечения до и после.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/before.jpg' })
  @IsOptional()
  @IsString()
  beforeImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/after.jpg' })
  @IsOptional()
  @IsString()
  afterImageUrl?: string;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', nullable: true })
  @IsOptional()
  @IsUUID('4')
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}