import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicSocialLinkDto {
  @ApiProperty({ enum: ClinicSocialPlatform, example: ClinicSocialPlatform.VK })
  @IsEnum(ClinicSocialPlatform)
  platform: ClinicSocialPlatform;

  @ApiProperty({ example: 'https://vk.com/clinic' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}