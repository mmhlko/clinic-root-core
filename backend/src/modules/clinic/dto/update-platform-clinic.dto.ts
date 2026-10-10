import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches, MaxLength } from 'class-validator';
import { ClinicStatus } from '../enum/clinic-status.enum.js';

export class UpdatePlatformClinicDto {
  @ApiPropertyOptional({ example: 'medika' })
  @IsOptional()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ enum: ClinicStatus })
  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;
}
