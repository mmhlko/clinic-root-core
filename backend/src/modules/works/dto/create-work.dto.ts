import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateWorkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  beforeImageUrl: string;

  @IsString()
  afterImageUrl: string;

  @IsOptional()
  @IsUUID('4')
  serviceId?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}