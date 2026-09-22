import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}