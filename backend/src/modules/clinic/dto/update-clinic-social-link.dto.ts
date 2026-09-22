import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';

export class UpdateClinicSocialLinkDto {
  @IsOptional()
  @IsEnum(ClinicSocialPlatform)
  platform?: ClinicSocialPlatform;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}