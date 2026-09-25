import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Правила оказания медицинских услуг' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'Информация для пациентов.', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  // @IsOptional()
  // @Type(() => Boolean)
  // @IsBoolean()
  // isActive?: boolean;
}