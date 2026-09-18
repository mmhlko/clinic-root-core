import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsUUID()
  directionId: string;

  @IsString()
  name: string;

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