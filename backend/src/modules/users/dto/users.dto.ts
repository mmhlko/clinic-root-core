import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import { UserRole } from '../user-role.enum.js';

import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ivan@example.com', description: 'Email пользователя' })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', description: 'Пароль пользователя' })
  @IsString()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER, description: 'Роль пользователя' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', description: 'ID локации' })
  @IsOptional()
  @IsUUID('4')
  locationId?: string;

  @ApiPropertyOptional({
    example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c',
    description: 'ID медиафайла фотографии',
  })
  @IsOptional()
  @IsUUID()
  photoMediaId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Иван', description: 'Имя пользователя' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Иванов', description: 'Фамилия пользователя' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'ivan@example.com', description: 'Email пользователя' })
  @IsOptional()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newSecurePass123', description: 'Новый пароль' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.MANAGER, description: 'Новая роль пользователя' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: '7a5af52a-3ef8-4f0d-8d10-cd3d33f4b7f1', description: 'ID локации' })
  @IsOptional()
  @IsUUID('4')
  locationId?: string | null;

  @ApiPropertyOptional({ example: 'd8d59a0d-4c79-4bd5-a2cf-1d0a744f5f5c' })
  @IsOptional()
  @IsUUID()
  photoMediaId?: string | null;
}