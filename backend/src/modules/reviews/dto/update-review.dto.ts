import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsDateString()
  reviewDate?: string | null;

  @IsOptional()
  @IsUUID('4')
  doctorId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}