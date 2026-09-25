import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkDto {
  @ApiProperty({ example: 'Восстановление улыбки' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Результат лечения до и после.' , nullable: true })
  @IsOptional()
  @ApiProperty({ example: 'https://example.com/before.jpg' })
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 'https://example.com/after.jpg' })
  @IsString()
  beforeImageUrl: string;

  @IsString()
  afterImageUrl: string;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', nullable: true })
  @IsOptional()
  @IsUUID('4')
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}