import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';

export class ClinicSocialLinkItemDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsEnum(ClinicSocialPlatform)
  platform: ClinicSocialPlatform;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

export class SaveClinicSocialLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicSocialLinkItemDto)
  socialLinks: ClinicSocialLinkItemDto[];
}