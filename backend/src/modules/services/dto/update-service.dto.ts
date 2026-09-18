import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsUUID()
  directionId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isPriceFrom?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}