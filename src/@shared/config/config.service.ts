import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly nestConfigService: NestConfigService<Config>) {}

  get nodeEnv(): string {
    return this.nestConfigService.get('NODE_ENV', { infer: true })!;
  }

  get port(): number {
    return this.nestConfigService.get('PORT', { infer: true })!;
  }

  get logLevel(): string {
    return this.nestConfigService.get('LOG_LEVEL', { infer: true })!;
  }

  get corsOrigin(): string {
    return this.nestConfigService.get('CORS_ORIGIN', { infer: true })!;
  }

  get supabaseUrl(): string {
    return this.nestConfigService.get('SUPABASE_URL', { infer: true })!;
  }

  get supabaseKey(): string {
    return this.nestConfigService.get('SUPABASE_KEY', { infer: true })!;
  }

  get supabaseServiceKey(): string {
    return this.nestConfigService.get('SUPABASE_SERVICE_KEY', { infer: true })!;
  }

  get databaseUrl(): string {
    return this.nestConfigService.get('DATABASE_URL', { infer: true })!;
  }

  get redisHost(): string {
    return this.nestConfigService.get('REDIS_HOST', { infer: true })!;
  }

  get redisPort(): number {
    return this.nestConfigService.get('REDIS_PORT', { infer: true })!;
  }

  get jwtSecret(): string {
    return this.nestConfigService.get('JWT_SECRET', { infer: true })!;
  }

  get swaggerTitle(): string {
    return this.nestConfigService.get('SWAGGER_TITLE', { infer: true })!;
  }

  get swaggerDescription(): string {
    return this.nestConfigService.get('SWAGGER_DESCRIPTION', { infer: true })!;
  }

  get swaggerVersion(): string {
    return this.nestConfigService.get('SWAGGER_VERSION', { infer: true })!;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
