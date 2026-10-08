import { validateEnvironment } from './env.validation.js';

const validEnvironment: Record<string, unknown> = {
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_DB: 'clinics',
  POSTGRES_USER: 'clinics',
  POSTGRES_PASSWORD: 'development-password',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  ROOT_ADMIN_EMAIL: 'admin@example.com',
  ROOT_ADMIN_PASSWORD: 'development-password',
  NODE_ENV: 'development',
};

describe('validateEnvironment', () => {
  it('reports missing required environment variables', () => {
    expect(() => validateEnvironment({})).toThrow(
      'Missing required environment variables: POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ROOT_ADMIN_EMAIL, ROOT_ADMIN_PASSWORD',
    );
  });

  it('defaults the application port and database synchronization safely', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      PORT: '3000',
      DATABASE_SYNCHRONIZE: 'false',
    });
  });

  it('allows synchronization only as an explicit development setting', () => {
    expect(
      validateEnvironment({
        ...validEnvironment,
        DATABASE_SYNCHRONIZE: 'true',
        NODE_ENV: 'development',
      }).DATABASE_SYNCHRONIZE,
    ).toBe('true');

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_SYNCHRONIZE: 'true',
        NODE_ENV: 'production',
      }),
    ).toThrow('DATABASE_SYNCHRONIZE=true is allowed only in development');

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_SYNCHRONIZE: 'true',
        NODE_ENV: 'test',
      }),
    ).toThrow('DATABASE_SYNCHRONIZE=true is allowed only in development');
  });

  it('rejects invalid ports and synchronization values', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, PORT: '70000' }),
    ).toThrow('PORT must be an integer between 1 and 65535');

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_SYNCHRONIZE: 'yes',
      }),
    ).toThrow('DATABASE_SYNCHRONIZE must be "true" or "false"');
  });

  it('requires a valid CORS allowlist in production', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
      }),
    ).toThrow('CORS_ORIGINS must be configured in production');

    expect(
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://clinic.example.com,https://admin.example.com',
      }).CORS_ORIGINS,
    ).toBe('https://clinic.example.com,https://admin.example.com');

    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        CORS_ORIGINS: 'https://clinic.example.com/admin',
      }),
    ).toThrow(
      'CORS_ORIGINS must contain origins only: https://clinic.example.com/admin',
    );
  });
});
