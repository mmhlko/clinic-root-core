import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClinicSocialLinkDto {
  @ApiPropertyOptional({ enum: ClinicSocialPlatform, example: ClinicSocialPlatform.VK })
  @IsOptional()
  @IsEnum(ClinicSocialPlatform)
  platform?: ClinicSocialPlatform;

  @ApiPropertyOptional({ example: 'https://vk.com/clinic' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}