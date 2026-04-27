import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppError } from '@shared/errors';
import { ResponseFactory } from '@shared/response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any)['requestId'] || '';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = undefined;

    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
      this.logger.warn({
        msg: exception.message,
        code: exception.code,
        requestId,
        stack: exception.stack,
      });
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        code = 'HTTP_EXCEPTION';
        if (Array.isArray(resp.message)) {
          details = resp.message;
          message = 'Validation failed';
          code = 'VALIDATION_FAILED';
        }
      } else {
        message = exception.message;
        code = 'HTTP_EXCEPTION';
      }
      this.logger.warn({ msg: message, code, requestId });
    } else {
      this.logger.error({
        msg: 'Unhandled exception',
        requestId,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    const errorResponse = ResponseFactory.error(code, message, details, requestId);
    response.status(statusCode).json(errorResponse);
  }
}
