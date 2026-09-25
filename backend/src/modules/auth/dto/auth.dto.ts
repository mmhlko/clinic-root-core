import { Transform } from 'class-transformer';
import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Email пользователя' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Пароль пользователя' })
  @IsString()
  password: string;
}