import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateReviewDto {
  @ApiProperty({ example: 'Анна Петрова' })
  @IsString()
  authorName: string;

  @ApiProperty({ example: 'Очень внимательный врач, приём прошёл комфортно.' })
  @IsString()
  text: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: '2026-09-20' })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID('4')
  doctorId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}