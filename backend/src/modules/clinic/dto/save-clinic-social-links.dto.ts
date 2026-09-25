import {
  IsArray,
  IsBoolean,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicSocialLinkItemDto {
  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ enum: ClinicSocialPlatform, example: ClinicSocialPlatform.VK })
  @IsEnum(ClinicSocialPlatform)
  platform: ClinicSocialPlatform;

  @ApiProperty({ example: 'https://vk.com/clinic' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveClinicSocialLinksDto {
  @ApiProperty({ type: [ClinicSocialLinkItemDto], example: [{ platform: ClinicSocialPlatform.VK, url: 'https://vk.com/clinic', sortOrder: 0, isActive: true }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClinicSocialLinkItemDto)
  socialLinks: ClinicSocialLinkItemDto[];
}