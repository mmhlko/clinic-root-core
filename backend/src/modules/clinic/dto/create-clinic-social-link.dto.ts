import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';

export class CreateClinicSocialLinkDto {
  @IsEnum(ClinicSocialPlatform)
  platform: ClinicSocialPlatform;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}