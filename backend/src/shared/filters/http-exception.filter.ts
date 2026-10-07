import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { localizeErrorMessage } from '../constants/error-messages.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const httpContext = host.switchToHttp();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? this.getLocalizedMessage(exception)
        : exception instanceof Error
          ? exception.message
          : String(exception);
    const responseBody =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body =
      typeof responseBody === 'object' && responseBody !== null
        ? {
            ...(responseBody as Record<string, unknown>),
            statusCode: status,
            message,
          }
        : { statusCode: status, message };

    if (!(exception instanceof HttpException) || status >= 500) {
      const stack =
        exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(message, stack);
    }

    httpAdapter.reply(
      httpContext.getResponse(),
      body,
      status,
    );
  }

  private getLocalizedMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return localizeErrorMessage(response);
    if (typeof response !== 'object' || response === null) {
      return localizeErrorMessage(exception.message);
    }

    const message = (response as Record<string, unknown>).message;
    if (typeof message === 'string') return localizeErrorMessage(message);
    if (Array.isArray(message)) {
      return message.map((value) => localizeErrorMessage(String(value))).join(' ');
    }

    return localizeErrorMessage(exception.message);
  }
}
