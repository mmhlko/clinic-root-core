import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
} from 'class-validator';

export class ReorderDoctorsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  doctorIds: string[];
}