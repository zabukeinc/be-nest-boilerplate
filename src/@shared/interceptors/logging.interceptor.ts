import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = (request as any)['requestId'] || '';
    const userId = (request as any)['user']?.id || 'anonymous';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log({
            msg: `${method} ${url}`,
            requestId,
            userId,
            duration,
            statusCode: context.switchToHttp().getResponse().statusCode,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error({
            msg: `${method} ${url} failed`,
            requestId,
            userId,
            duration,
            error: error.message,
          });
        },
      }),
    );
  }
}
