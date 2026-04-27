import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SharedModule } from './@shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { ProductModule } from './modules/product/product.module';
import { AppConfigService } from './@shared/config';
import { AllExceptionsFilter } from './@shared/filters/all-exceptions.filter';
import { TransformInterceptor } from './@shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './@shared/interceptors/logging.interceptor';
import { AuditInterceptor } from './@shared/interceptors/audit.interceptor';
import { AuditLogProcessor } from './@shared/processors/audit-log.processor';

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    UserModule,
    PostModule,
    ProductModule,
  ],
  providers: [
    AuditLogProcessor,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
