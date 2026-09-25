import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FaqItemDto {
  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ example: 'Как записаться на приём?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Позвоните нам или оставьте заявку на сайте.' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SaveFaqDto {
  @ApiProperty({ type: [FaqItemDto], example: [{ question: 'Как записаться на приём?', answer: 'Позвоните нам или оставьте заявку на сайте.', sortOrder: 0, isActive: true }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs: FaqItemDto[];
}
