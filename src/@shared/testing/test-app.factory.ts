import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { validateConfig } from '@shared/config/config.schema';

export class TestAppFactory {
  private app: INestApplication;
  private module: TestingModule;

  async create(moduleMetadata: any): Promise<INestApplication> {
    this.module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate: validateConfig,
          load: [
            () => ({
              NODE_ENV: 'test',
              PORT: 3000,
              LOG_LEVEL: 'error',
              CORS_ORIGIN: '*',
              SUPABASE_URL: 'https://test.supabase.co',
              SUPABASE_KEY: 'test-key',
              SUPABASE_SERVICE_KEY: 'test-service-key',
              DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
              REDIS_HOST: 'localhost',
              REDIS_PORT: 6379,
              JWT_SECRET: 'test-jwt-secret',
            }),
          ],
        }),
        CqrsModule,
        ...(moduleMetadata.imports || []),
      ],
      providers: [...(moduleMetadata.providers || [])],
      controllers: [...(moduleMetadata.controllers || [])],
    }).compile();

    this.app = this.module.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await this.app.init();
    return this.app;
  }

  async close(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  get<T>(token: any): T {
    return this.module.get<T>(token);
  }
}
