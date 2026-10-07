import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter
  implements ExceptionFilter
{
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(429).json({
      statusCode: 429,
      message: 'Слишком много запросов. Попробуйте позже.',
    });
  }
}