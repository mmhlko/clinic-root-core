import { Transform } from 'class-transformer';
import { IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}