import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseFactory } from '@shared/response';
import { SKIP_TRANSFORM_KEY } from '@shared/decorators/skip-transform.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const skipTransform = this.reflector.get<boolean>(SKIP_TRANSFORM_KEY, context.getHandler());
    if (skipTransform) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const requestId = (request as any)['requestId'] || '';

    return next.handle().pipe(
      map((data) => {
        if (data && (data as any).pagination) {
          return ResponseFactory.paginated(
            (data as any).items,
            (data as any).pagination,
            'Success',
            requestId,
          );
        }
        return ResponseFactory.success(data, 'Success', requestId);
      }),
    );
  }
}
