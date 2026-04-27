import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AUDIT_LOG_KEY, AuditLogOptions } from '@shared/decorators/audit-log.decorator';
import { QUEUE_NAMES } from '@shared/queue';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectQueue(QUEUE_NAMES.AUDIT) private readonly auditQueue: Queue,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditLogOptions>(AUDIT_LOG_KEY, context.getHandler());
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = (request as any)['user']?.id || null;

    return next.handle().pipe(
      tap((result) => {
        this.auditQueue
          .add('audit-log', {
            userId,
            action: auditOptions.action,
            entity: auditOptions.entity,
            entityId: result?.data?.id || result?.id,
            changes: request.body,
            timestamp: new Date().toISOString(),
          })
          .catch(() => {});
      }),
    );
  }
}
