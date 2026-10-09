import { Type } from 'class-transformer';
import {
  IsEmail,
  IsDefined,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateClinicDto } from './create-clinic.dto.js';

class CreateClinicAdministratorDto {
  @ApiProperty({ example: 'Анна' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Иванова' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'admin@clinic.example' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'InitialPassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateTenantClinicDto {
  @ApiProperty({ type: CreateClinicDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateClinicDto)
  clinic: CreateClinicDto;

  @ApiProperty({ type: CreateClinicAdministratorDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateClinicAdministratorDto)
  admin: CreateClinicAdministratorDto;
}
