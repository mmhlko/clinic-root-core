import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  newPrice?: number | null;

  @IsOptional()
  @IsDateString()
  validFrom?: string | null;

  @IsOptional()
  @IsDateString()
  validTo?: string | null;

  @IsOptional()
  @IsUUID('4')
  serviceId?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}