import { BadRequestException } from '@nestjs/common';

export function normalizeRussianPhone(
  phone: string,
): string {
  const digits = phone.replace(/\D/g, '');

  let normalized: string;

  if (
    digits.length === 11 &&
    digits.startsWith('8')
  ) {
    normalized = `+7${digits.slice(1)}`;
  } else if (
    digits.length === 11 &&
    digits.startsWith('7')
  ) {
    normalized = `+${digits}`;
  } else {
    throw new BadRequestException(
      'Invalid Russian phone number',
    );
  }

  // Российский мобильный номер:
  // +7 9XX XXX XX XX
  if (!/^\+79\d{9}$/.test(normalized)) {
    throw new BadRequestException(
      'Invalid Russian mobile phone number',
    );
  }

  return normalized;
}