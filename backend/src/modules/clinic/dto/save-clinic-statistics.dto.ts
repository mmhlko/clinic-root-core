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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicStatisticItemDto {
  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ example: '10+' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'лет опыта' })
  @IsString()
  label: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveClinicStatisticsDto {
  @ApiProperty({ type: [ClinicStatisticItemDto], example: [{ value: '10+', label: 'лет опыта', sortOrder: 0, isActive: true }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicStatisticItemDto)
  statistics: ClinicStatisticItemDto[];
}