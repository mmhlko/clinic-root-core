import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class ClinicStatisticItemDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsInt()
  @Min(0)
  sortOrder: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveClinicStatisticsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicStatisticItemDto)
  statistics: ClinicStatisticItemDto[];
}