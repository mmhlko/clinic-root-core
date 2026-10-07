import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateServiceDirectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}