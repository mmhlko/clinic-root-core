import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { ClinicImportDto } from './clinic-import.dto.js';

function formatErrors(errors: ValidationError[], parent = ''): Array<{ path: string; message: string }> {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({ path, message }));
    return [...own, ...formatErrors(error.children ?? [], path)];
  });
}

export async function validateClinicImportPayload(payload: unknown): Promise<ClinicImportDto> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BadRequestException({ message: 'JSON должен содержать объект клиники.', errors: [{ path: '$', message: 'Ожидался JSON-объект.' }] });
  }
  const dto = plainToInstance(ClinicImportDto, payload);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });
  if (errors.length) {
    throw new BadRequestException({
      message: 'Проверьте поля JSON по схеме импорта.',
      errors: formatErrors(errors),
    });
  }
  return dto;
}
