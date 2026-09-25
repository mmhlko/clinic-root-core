import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ example: 'Как записаться на приём?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'Позвоните нам или оставьте заявку на сайте.' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}