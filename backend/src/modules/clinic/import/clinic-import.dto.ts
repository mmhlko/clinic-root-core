import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  Equals,
  IsEmail,
  IsEnum,
  IsDateString,
  IsObject,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';
import { CLINIC_IMPORT_SCHEMA_VERSION } from './clinic-import-version.js';

export class ClinicImportProfileDto {
  @IsOptional() @IsString() @Length(1, 160) name?: string;
  @IsOptional() @IsString() @MaxLength(500) shortDescription?: string | null;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() @MaxLength(255) slogan?: string | null;
  @IsOptional() @IsString() @MaxLength(80) phone?: string | null;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string | null;
  @IsOptional() @IsString() @MaxLength(255) legalName?: string | null;
  @IsOptional() @IsString() @MaxLength(100) licenseNumber?: string | null;
  @IsOptional() @IsDateString() licenseDate?: string | null;
  @IsOptional() @IsString() @MaxLength(20) inn?: string | null;
  @IsOptional() @IsString() @MaxLength(20) ogrn?: string | null;
}

export class ClinicImportLocationDto {
  @IsString() @Length(1, 160) name!: string;
  @IsString() @Length(1, 255) address!: string;
  @IsOptional() @IsString() @MaxLength(80) phone?: string | null;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string | null;
  @IsOptional() @IsObject() workingHours?: Record<string, string> | null;
  @IsOptional() @IsUrl({ require_protocol: true }) mapUrl?: string | null;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportSocialLinkDto {
  @IsEnum(ClinicSocialPlatform) platform!: ClinicSocialPlatform;
  @IsUrl({ require_protocol: true }) url!: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportStatisticDto {
  @IsString() @Length(1, 100) value!: string;
  @IsString() @Length(1, 160) label!: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportFeatureDto {
  @IsString() @Length(1, 160) title!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() icon?: string | null;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportServiceDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsNumber() @Min(0) price?: number | null;
  @IsOptional() @IsBoolean() isPriceFrom?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportDirectionDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(500)
  @ValidateNested({ each: true }) @Type(() => ClinicImportServiceDto)
  services?: ClinicImportServiceDto[];
}

export class ClinicImportDoctorDto {
  @IsString() @Length(1, 100) firstName!: string;
  @IsString() @Length(1, 100) lastName!: string;
  @IsOptional() @IsString() @MaxLength(100) middleName?: string | null;
  @IsString() @Length(1, 160) specialization!: string;
  @IsOptional() @IsInt() @Min(1900) @Max(new Date().getFullYear()) experienceStartYear?: number | null;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) photoUrl?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class ClinicImportReviewDto {
  @IsString() @Length(1, 160) authorName!: string;
  @IsString() @Length(1, 10000) text!: string;
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() @MaxLength(40) reviewDate?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportPromotionDto {
  @IsString() @Length(1, 200) title!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) photoUrl?: string | null;
  @IsOptional() @IsNumber() @Min(0) oldPrice?: number | null;
  @IsOptional() @IsNumber() @Min(0) newPrice?: number | null;
  @IsOptional() @IsDateString() validFrom?: string | null;
  @IsOptional() @IsDateString() validTo?: string | null;
  @IsOptional() @IsString() directionName?: string;
  @IsOptional() @IsString() serviceName?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportFaqDto {
  @IsString() @Length(1, 500) question!: string;
  @IsString() @Length(1, 10000) answer!: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportDocumentDto {
  @IsString() @Length(1, 255) title!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsUrl({ protocols: ['https'], require_protocol: true }) sourceUrl!: string;
  @IsOptional() @IsString() @MaxLength(255) fileName?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ClinicImportDto {
  @IsInt() @Equals(CLINIC_IMPORT_SCHEMA_VERSION) schemaVersion!: number;
  @ValidateNested() @Type(() => ClinicImportProfileDto)
  clinic!: ClinicImportProfileDto;
  @IsOptional() @IsArray() @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => ClinicImportLocationDto)
  locations?: ClinicImportLocationDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => ClinicImportSocialLinkDto)
  socialLinks?: ClinicImportSocialLinkDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => ClinicImportStatisticDto)
  statistics?: ClinicImportStatisticDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => ClinicImportFeatureDto)
  features?: ClinicImportFeatureDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => ClinicImportDirectionDto)
  directions?: ClinicImportDirectionDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(500)
  @ValidateNested({ each: true }) @Type(() => ClinicImportDoctorDto)
  doctors?: ClinicImportDoctorDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(2000)
  @ValidateNested({ each: true }) @Type(() => ClinicImportReviewDto)
  reviews?: ClinicImportReviewDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(200)
  @ValidateNested({ each: true }) @Type(() => ClinicImportPromotionDto)
  promotions?: ClinicImportPromotionDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(500)
  @ValidateNested({ each: true }) @Type(() => ClinicImportFaqDto)
  faq?: ClinicImportFaqDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(200)
  @ValidateNested({ each: true }) @Type(() => ClinicImportDocumentDto)
  documents?: ClinicImportDocumentDto[];
}
