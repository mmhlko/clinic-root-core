import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Скидка на профессиональную чистку' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Скидка 15% при записи до конца месяца.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/promotion.jpg', nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 5000, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number | null;

  @ApiPropertyOptional({ example: 4250, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newPrice?: number | null;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  validFrom?: string | null;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  validTo?: string | null;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', nullable: true })
  @IsOptional()
  @IsUUID('4')
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}