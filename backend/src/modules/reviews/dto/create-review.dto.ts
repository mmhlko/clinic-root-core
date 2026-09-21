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


export class CreateReviewDto {
  @IsString()
  authorName: string;

  @IsString()
  text: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @IsOptional()
  @IsUUID('4')
  doctorId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}