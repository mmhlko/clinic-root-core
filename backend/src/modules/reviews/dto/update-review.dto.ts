import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 'Анна Петрова' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ example: 'Очень внимательный врач, приём прошёл комфортно.' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: '2026-09-20', nullable: true })
  @IsOptional()
  @IsDateString()
  reviewDate?: string | null;

  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c', nullable: true })
  @IsOptional()
  @IsUUID('4')
  doctorId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}