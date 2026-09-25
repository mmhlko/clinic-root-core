import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFaqDto {
  @ApiPropertyOptional({ example: 'Как записаться на приём?' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ example: 'Позвоните нам или оставьте заявку на сайте.' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}