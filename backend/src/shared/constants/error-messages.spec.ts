import { describe, expect, it } from 'vitest';

import { ERROR_MESSAGES, localizeErrorMessage } from './error-messages.js';

describe('localizeErrorMessage', () => {
  it('translates known backend errors', () => {
    expect(localizeErrorMessage('Service not found')).toBe(
      ERROR_MESSAGES.serviceNotFound,
    );
  });

  it('translates conflicts when deleting a location assigned to users', () => {
    expect(
      localizeErrorMessage('Cannot delete clinic location with assigned users'),
    ).toBe(ERROR_MESSAGES.clinicLocationHasAssignedUsers);
  });

  it('translates backend errors containing resource identifiers', () => {
    expect(localizeErrorMessage('Doctor doctor-id not found')).toBe(
      ERROR_MESSAGES.doctorNotFound,
    );
  });

  it('translates a missing doctor error without an identifier', () => {
    expect(localizeErrorMessage('Doctor not found')).toBe(
      ERROR_MESSAGES.doctorNotFound,
    );
  });

  it('preserves messages that are already in Russian', () => {
    expect(localizeErrorMessage('Проверьте номер телефона.')).toBe(
      'Проверьте номер телефона.',
    );
  });

  it('preserves unrecognized backend messages', () => {
    expect(localizeErrorMessage('Unexpected backend message')).toBe(
      'Unexpected backend message',
    );
  });
});
