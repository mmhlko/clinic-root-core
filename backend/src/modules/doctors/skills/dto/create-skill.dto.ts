import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'Имплантация зубов' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}