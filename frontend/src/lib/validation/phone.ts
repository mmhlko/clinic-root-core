const RUSSIAN_MOBILE_PHONE_PATTERN = /^79\d{9}$/;
const PHONE_FORMATTING_PATTERN = /^\+?[\d\s().-]+$/;

export const RUSSIAN_MOBILE_PHONE_ERROR =
  "Введите мобильный номер в формате +7 900 123-45-67.";

export function validateRussianMobilePhone(value: string): string | null {
  const phone = value.trim();
  if (!phone || !PHONE_FORMATTING_PATTERN.test(phone)) {
    return RUSSIAN_MOBILE_PHONE_ERROR;
  }

  const digits = phone.replace(/\D/g, "");
  const normalizedDigits =
    digits.length === 11 && digits.startsWith("8")
      ? `7${digits.slice(1)}`
      : digits;

  return RUSSIAN_MOBILE_PHONE_PATTERN.test(normalizedDigits)
    ? null
    : RUSSIAN_MOBILE_PHONE_ERROR;
}
