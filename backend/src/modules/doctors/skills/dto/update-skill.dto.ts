import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSkillDto {
  @ApiPropertyOptional({ example: 'Имплантация зубов' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}