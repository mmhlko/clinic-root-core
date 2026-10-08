const requiredVariables = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ROOT_ADMIN_EMAIL',
  'ROOT_ADMIN_PASSWORD',
] as const;

function validatePort(name: string, value: unknown): void {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const missingVariables = requiredVariables.filter((name) => {
    const value = config[name];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    );
  }

  const port = config.PORT ?? '3000';
  validatePort('PORT', port);
  validatePort('POSTGRES_PORT', config.POSTGRES_PORT);

  const synchronize = config.DATABASE_SYNCHRONIZE ?? 'false';
  if (synchronize !== 'true' && synchronize !== 'false') {
    throw new Error('DATABASE_SYNCHRONIZE must be "true" or "false"');
  }
  if (synchronize === 'true' && config.NODE_ENV !== 'development') {
    throw new Error(
      'DATABASE_SYNCHRONIZE=true is allowed only in development',
    );
  }

  const corsOrigins = config.CORS_ORIGINS ?? (
    config.NODE_ENV === 'production' ? '' : 'http://localhost:3001'
  );
  if (typeof corsOrigins !== 'string' || !corsOrigins.trim()) {
    throw new Error('CORS_ORIGINS must be configured in production');
  }

  const parsedCorsOrigins = corsOrigins.split(',').map((origin) => origin.trim());
  for (const origin of parsedCorsOrigins) {
    let parsedOrigin: URL;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGINS contains an invalid origin: ${origin}`);
    }

    if (
      !['http:', 'https:'].includes(parsedOrigin.protocol) ||
      parsedOrigin.origin !== origin
    ) {
      throw new Error(`CORS_ORIGINS must contain origins only: ${origin}`);
    }
  }

  return {
    ...config,
    PORT: String(port),
    DATABASE_SYNCHRONIZE: synchronize,
    CORS_ORIGINS: parsedCorsOrigins.join(','),
  };
}
