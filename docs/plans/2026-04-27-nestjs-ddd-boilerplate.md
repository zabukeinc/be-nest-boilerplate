# NestJS DDD Hexagonal Boilerplate Implementation Plan

Implementation plan for the NestJS DDD Hexagonal Boilerplate. Follow tasks in order, checking off each step.

**Goal:** Build a production-ready NestJS + TypeScript boilerplate with DDD, Hexagonal Architecture, CQRS, Supabase integration, and all cross-cutting concerns.

**Architecture:** Strict hexagonal with ports/adapters per module. Domain layer has zero external dependencies. Infrastructure implements domain port interfaces. CQRS via @nestjs/cqrs. Standard response format with global error handling.

**Tech Stack:** NestJS 10+, TypeScript, Prisma, Supabase (Auth+DB+Storage), @nestjs/cqrs, BullMQ, Redis, nestjs-pino, class-validator, class-transformer, Zod, @nestjs/swagger, Jest, Supertest

---

## Task 1: Project Scaffolding & Dependencies

**Files:**

- Create: `package.json`
- Create: `nest-cli.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `.eslintrc.js`
- Create: `.prettierrc`

- [ ] **Step 1: Initialize NestJS project**

```bash
cd /Users/regyanax/Documents/projects/backend
npx @nestjs/cli@latest new . --package-manager npm --skip-git --skip-install
```

If prompted about overwriting, confirm. Then install all dependencies:

```bash
npm install @nestjs/config @nestjs/cqrs @nestjs/swagger @nestjs/throttler @nestjs/cache-manager @nestjs/bullmq @nestjs/event-emitter @nestjs/platform-express nestjs-pino @prisma/client prisma class-validator class-transformer zod @supabase/supabase-js ioredis cache-manager uuid helmet
npm install -D @types/uuid @types/express @nestjs/testing jest supertest @types/supertest ts-jest
```

- [ ] **Step 2: Configure tsconfig.json with path aliases**

Replace `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@shared/*": ["src/@shared/*"],
      "@modules/*": ["src/modules/*"],
      "@config": ["src/@shared/config"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Configure tsconfig.build.json**

Replace `tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

- [ ] **Step 4: Configure nest-cli.json with path aliases**

Replace `nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ],
    "webpack": {
      "paths": {
        "@shared/*": ["src/@shared/*"],
        "@modules/*": ["src/modules/*"],
        "@config": ["src/@shared/config"]
      }
    }
  }
}
```

- [ ] **Step 5: Create .env.example**

```
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/boilerplate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret

# Swagger
SWAGGER_TITLE=NestJS DDD Boilerplate
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_VERSION=1.0
```

- [ ] **Step 6: Update .gitignore**

Append to `.gitignore`:

```
.env
dist/
node_modules/
*.pem
coverage/
```

- [ ] **Step 7: Configure ESLint**

Replace `.eslintrc.js`:

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

- [ ] **Step 8: Configure Prettier**

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 9: Update jest config for path aliases**

Replace `jest.config.ts` (or create if it doesn't exist):

```typescript
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const tsconfig = require('./tsconfig.json');

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
```

Wait — `ts-jest/utils` is deprecated. Use this instead:

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/@shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config$': '<rootDir>/src/@shared/config',
  },
};

export default config;
```

- [ ] **Step 10: Initialize Prisma**

```bash
npx prisma init
```

Then commit initial setup:

```bash
git add -A
git commit -m "chore: initialize nestjs project with dependencies and config"
```

---

## Task 2: Error Classes & Error Catalog

**Files:**

- Create: `src/@shared/errors/app.error.ts`
- Create: `src/@shared/errors/not-found.error.ts`
- Create: `src/@shared/errors/validation.error.ts`
- Create: `src/@shared/errors/unauthorized.error.ts`
- Create: `src/@shared/errors/forbidden.error.ts`
- Create: `src/@shared/errors/conflict.error.ts`
- Create: `src/@shared/errors/domain.error.ts`
- Create: `src/@shared/errors/error-code.enum.ts`
- Create: `src/@shared/errors/index.ts`

- [ ] **Step 1: Create error code enum**

Create `src/@shared/errors/error-code.enum.ts`:

```typescript
export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  DOMAIN_ERROR = 'DOMAIN_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EMAIL_EXISTS = 'USER_EMAIL_EXISTS',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  POST_ALREADY_PUBLISHED = 'POST_ALREADY_PUBLISHED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

- [ ] **Step 2: Create base AppError**

Create `src/@shared/errors/app.error.ts`:

```typescript
import { ErrorCode } from './error-code.enum';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}
```

- [ ] **Step 3: Create specific error classes**

Create `src/@shared/errors/not-found.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NOT_FOUND, details?: any) {
    super(code, message, 404, details);
  }
}
```

Create `src/@shared/errors/validation.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_FAILED, message, 400, details);
  }
}
```

Create `src/@shared/errors/unauthorized.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    details?: any,
  ) {
    super(code, message, 401, details);
  }
}
```

Create `src/@shared/errors/forbidden.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: ErrorCode = ErrorCode.FORBIDDEN, details?: any) {
    super(code, message, 403, details);
  }
}
```

Create `src/@shared/errors/conflict.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT, details?: any) {
    super(code, message, 409, details);
  }
}
```

Create `src/@shared/errors/domain.error.ts`:

```typescript
import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class DomainError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.DOMAIN_ERROR, details?: any) {
    super(code, message, 422, details);
  }
}
```

- [ ] **Step 4: Create barrel export**

Create `src/@shared/errors/index.ts`:

```typescript
export { AppError } from './app.error';
export { NotFoundError } from './not-found.error';
export { ValidationError } from './validation.error';
export { UnauthorizedError } from './unauthorized.error';
export { ForbiddenError } from './forbidden.error';
export { ConflictError } from './conflict.error';
export { DomainError } from './domain.error';
export { ErrorCode } from './error-code.enum';
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add error classes hierarchy and error code catalog"
```

---

## Task 3: Standard Response Format

**Files:**

- Create: `src/@shared/response/response.interface.ts`
- Create: `src/@shared/response/response.factory.ts`
- Create: `src/@shared/response/index.ts`

- [ ] **Step 1: Create response interfaces**

Create `src/@shared/response/response.interface.ts`:

```typescript
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  meta?: ResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: any;
  };
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

- [ ] **Step 2: Create response factory**

Create `src/@shared/response/response.factory.ts`:

```typescript
import {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  ResponseMeta,
  PaginationMeta,
} from './response.interface';

export class ResponseFactory {
  static success<T>(data: T, message: string = 'Success', requestId?: string): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  static paginated<T>(
    data: T[],
    pagination: { page: number; limit: number; totalItems: number },
    message: string = 'Success',
    requestId?: string,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(pagination.totalItems / pagination.limit);
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  static error(code: string, message: string, details?: any, requestId?: string): ApiErrorResponse {
    const response: ApiErrorResponse = {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }),
      },
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  private static createMeta(requestId: string): ResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}
```

- [ ] **Step 3: Create barrel export**

Create `src/@shared/response/index.ts`:

```typescript
export * from './response.interface';
export * from './response.factory';
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add standard response format interfaces and factory"
```

---

## Task 4: Configuration Module (Zod Validation)

**Files:**

- Create: `src/@shared/config/config.schema.ts`
- Create: `src/@shared/config/config.service.ts`
- Create: `src/@shared/config/config.module.ts`
- Create: `src/@shared/config/index.ts`

- [ ] **Step 1: Create Zod config schema**

Create `src/@shared/config/config.schema.ts`:

```typescript
import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  CORS_ORIGIN: z.string().default('*'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),

  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  JWT_SECRET: z.string(),

  SWAGGER_TITLE: z.string().default('NestJS DDD Boilerplate'),
  SWAGGER_DESCRIPTION: z.string().default('API Documentation'),
  SWAGGER_VERSION: z.string().default('1.0'),
});

export type Config = z.infer<typeof configSchema>;

export const validateConfig = (config: Record<string, any>): Config => {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, value]) => `  ${key}: ${value?.join(', ')}`)
      .join('\n');
    throw new Error(`Config validation error:\n${formatted}`);
  }
  return result.data;
};
```

- [ ] **Step 2: Create typed config service**

Create `src/@shared/config/config.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly nestConfigService: NestConfigService<Config>) {}

  get nodeEnv(): string {
    return this.nestConfigService.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.nestConfigService.get('PORT', { infer: true });
  }

  get logLevel(): string {
    return this.nestConfigService.get('LOG_LEVEL', { infer: true });
  }

  get corsOrigin(): string {
    return this.nestConfigService.get('CORS_ORIGIN', { infer: true });
  }

  get supabaseUrl(): string {
    return this.nestConfigService.get('SUPABASE_URL', { infer: true });
  }

  get supabaseKey(): string {
    return this.nestConfigService.get('SUPABASE_KEY', { infer: true });
  }

  get supabaseServiceKey(): string {
    return this.nestConfigService.get('SUPABASE_SERVICE_KEY', { infer: true });
  }

  get databaseUrl(): string {
    return this.nestConfigService.get('DATABASE_URL', { infer: true });
  }

  get redisHost(): string {
    return this.nestConfigService.get('REDIS_HOST', { infer: true });
  }

  get redisPort(): number {
    return this.nestConfigService.get('REDIS_PORT', { infer: true });
  }

  get jwtSecret(): string {
    return this.nestConfigService.get('JWT_SECRET', { infer: true });
  }

  get swaggerTitle(): string {
    return this.nestConfigService.get('SWAGGER_TITLE', { infer: true });
  }

  get swaggerDescription(): string {
    return this.nestConfigService.get('SWAGGER_DESCRIPTION', { infer: true });
  }

  get swaggerVersion(): string {
    return this.nestConfigService.get('SWAGGER_VERSION', { infer: true });
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
```

- [ ] **Step 3: Create config module**

Create `src/@shared/config/config.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateConfig } from './config.schema';
import { AppConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      envFilePath: ['.env'],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
```

- [ ] **Step 4: Create barrel export**

Create `src/@shared/config/index.ts`:

```typescript
export * from './config.schema';
export * from './config.service';
export * from './config.module';
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add config module with zod validation and typed service"
```

---

## Task 5: Logging Module (nestjs-pino)

**Files:**

- Create: `src/@shared/logging/logging.service.ts`
- Create: `src/@shared/logging/logging.module.ts`
- Create: `src/@shared/logging/index.ts`

- [ ] **Step 1: Create logging service**

Create `src/@shared/logging/logging.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger();

  info(message: string, context?: Record<string, any>): void {
    this.logger.log({ msg: message, ...context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn({ msg: message, ...context });
  }

  error(message: string, context?: Record<string, any>, trace?: string): void {
    this.logger.error({ msg: message, ...context }, trace);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug({ msg: message, ...context });
  }
}
```

- [ ] **Step 2: Create logging module**

Create `src/@shared/logging/logging.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') !== 'production';
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL') || 'info',
            transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
            redact: ['req.headers.authorization', 'req.body.password'],
            serializers: {
              req(req: any) {
                return {
                  method: req.method,
                  url: req.url,
                  id: req.id,
                };
              },
            },
          },
        };
      },
    }),
  ],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
```

- [ ] **Step 3: Create barrel export**

Create `src/@shared/logging/index.ts`:

```typescript
export * from './logging.service';
export * from './logging.module';
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add logging module with pino structured logging"
```

---

## Task 6: Middleware, Interceptors, Filters & Guards

**Files:**

- Create: `src/@shared/middleware/request-id.middleware.ts`
- Create: `src/@shared/interceptors/transform.interceptor.ts`
- Create: `src/@shared/interceptors/logging.interceptor.ts`
- Create: `src/@shared/filters/all-exceptions.filter.ts`
- Create: `src/@shared/guards/auth.guard.ts`
- Create: `src/@shared/guards/throttler.guard.ts`

- [ ] **Step 1: Create request ID middleware**

Create `src/@shared/middleware/request-id.middleware.ts`:

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req['requestId'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}
```

- [ ] **Step 2: Create transform interceptor**

Create `src/@shared/interceptors/transform.interceptor.ts`:

```typescript
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
    const requestId = request['requestId'] || '';

    return next.handle().pipe(
      map((data) => {
        if (data && data.pagination) {
          return ResponseFactory.paginated(data.items, data.pagination, 'Success', requestId);
        }
        return ResponseFactory.success(data, 'Success', requestId);
      }),
    );
  }
}
```

- [ ] **Step 3: Create skip-transform decorator (needed by interceptor)**

Create `src/@shared/decorators/skip-transform.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
```

- [ ] **Step 4: Create logging interceptor**

Create `src/@shared/interceptors/logging.interceptor.ts`:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = request['requestId'] || '';
    const userId = request['user']?.id || 'anonymous';
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
```

- [ ] **Step 5: Create all-exceptions filter**

Create `src/@shared/filters/all-exceptions.filter.ts`:

```typescript
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
```

- [ ] **Step 6: Create Supabase auth guard**

Create `src/@shared/guards/auth.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '@shared/supabase';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const { data, error } = await this.supabaseService.client.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request['user'] = {
      id: data.user.id,
      email: data.user.email,
      roles: data.user.app_metadata?.roles || [],
    };

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
```

- [ ] **Step 7: Create roles decorator and guard**

Create `src/@shared/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

Create `src/@shared/guards/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@shared/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

- [ ] **Step 8: Create throttler guard**

Create `src/@shared/guards/throttler.guard.ts`:

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

export { ThrottlerGuard };
```

We re-export from `@nestjs/throttler` for centralized import. When custom throttler logic is needed, this file will be the place to override.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add request-id middleware, transform/logging interceptors, exception filter, auth/roles guards"
```

---

## Task 7: Pagination DTOs & Utilities

**Files:**

- Create: `src/@shared/pagination/pagination.dto.ts`
- Create: `src/@shared/pagination/pagination.utils.ts`
- Create: `src/@shared/pagination/index.ts`

- [ ] **Step 1: Create pagination DTOs**

Create `src/@shared/pagination/pagination.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order: asc or desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
  };
}
```

- [ ] **Step 2: Create pagination utilities**

Create `src/@shared/pagination/pagination.utils.ts`:

```typescript
import { Prisma } from '@prisma/client';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function getPaginationParams(query: PaginationParams) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const orderBy: Prisma.OrderByWithRelationInput = query.sortBy
    ? { [query.sortBy]: query.sortOrder || 'desc' }
    : { createdAt: 'desc' as const };

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy,
  };
}
```

- [ ] **Step 3: Create barrel export**

Create `src/@shared/pagination/index.ts`:

```typescript
export * from './pagination.dto';
export * from './pagination.utils';
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add pagination DTOs and utility functions"
```

---

## Task 8: Prisma Schema & Module

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `src/@shared/database/prisma.service.ts`
- Create: `src/@shared/database/prisma.module.ts`
- Create: `src/@shared/database/index.ts`

- [ ] **Step 1: Create Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  avatarUrl String?
  role      String   @default("user")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  posts Post[]

  @@map("users")
}

model Post {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String?
  imageUrl    String?  @map("image_url")
  published   Boolean  @default(false)
  authorId    String   @map("author_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  publishedAt DateTime? @map("published_at")
  deletedAt   DateTime? @map("deleted_at")

  author User @relation(fields: [authorId], references: [id])

  @@map("posts")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  action    String
  entity    String
  entityId  String?  @map("entity_id")
  changes   Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

- [ ] **Step 2: Create Prisma service**

Create `src/@shared/database/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');

    (this as any).$on('query', (e: any) => {
      this.logger.debug({
        msg: 'Query',
        query: e.query,
        duration: e.duration,
      });
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
```

- [ ] **Step 3: Create Prisma module**

Create `src/@shared/database/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 4: Create barrel export**

Create `src/@shared/database/index.ts`:

```typescript
export * from './prisma.service';
export * from './prisma.module';
```

- [ ] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add prisma schema with user, post, audit_log models and prisma module"
```

---

## Task 9: Supabase Module

**Files:**

- Create: `src/@shared/supabase/supabase.module.ts`
- Create: `src/@shared/supabase/supabase.service.ts`
- Create: `src/@shared/supabase/storage.port.ts`
- Create: `src/@shared/supabase/supabase-storage.adapter.ts`
- Create: `src/@shared/supabase/index.ts`

- [ ] **Step 1: Create storage port (interface)**

Create `src/@shared/supabase/storage.port.ts`:

```typescript
export interface StoragePort {
  upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
```

- [ ] **Step 2: Create Supabase service**

Create `src/@shared/supabase/supabase.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfigService } from '@shared/config';

@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient;
  public readonly adminClient: SupabaseClient;

  constructor(private readonly configService: AppConfigService) {
    this.client = createClient(configService.supabaseUrl, configService.supabaseKey);
    this.adminClient = createClient(configService.supabaseUrl, configService.supabaseServiceKey);
  }
}
```

- [ ] **Step 3: Create Supabase storage adapter**

Create `src/@shared/supabase/supabase-storage.adapter.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { StoragePort } from './storage.port';

@Injectable()
export class SupabaseStorageAdapter implements StoragePort {
  constructor(private readonly supabaseService: SupabaseService) {}

  async upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = this.supabaseService.adminClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabaseService.adminClient.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
```

- [ ] **Step 4: Create Supabase module**

Create `src/@shared/supabase/supabase.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseStorageAdapter } from './supabase-storage.adapter';
import { STORAGE_PORT } from './storage.port';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: STORAGE_PORT,
      useClass: SupabaseStorageAdapter,
    },
  ],
  exports: [SupabaseService, STORAGE_PORT],
})
export class SupabaseModule {}
```

- [ ] **Step 5: Create barrel export**

Create `src/@shared/supabase/index.ts`:

```typescript
export * from './supabase.module';
export * from './supabase.service';
export * from './supabase-storage.adapter';
export * from './storage.port';
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add supabase module with auth client, storage port, and storage adapter"
```

---

## Task 10: Cache Module & Decorator

**Files:**

- Create: `src/@shared/cache/cache.module.ts`
- Create: `src/@shared/cache/cache.service.ts`
- Create: `src/@shared/cache/cache.decorator.ts`
- Create: `src/@shared/cache/index.ts`

- [ ] **Step 1: Create cache service**

Create `src/@shared/cache/cache.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private client: ReturnType<typeof createClient>;

  constructor(private readonly redisUrl: string) {
    this.client = createClient(redisUrl);
    this.client.on('error', (err) => {
      this.logger.error('Redis client error', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, serialized, 'EX', ttl);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  generateKey(prefix: string, ...args: any[]): string {
    return `${prefix}:${args.map((a) => JSON.stringify(a)).join(':')}`;
  }
}
```

Wait, `ioredis` doesn't have `createClient` — that's the `redis` package. With `ioredis` we use `new Redis()`. Let me fix:

Create `src/@shared/cache/cache.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;

  constructor(host: string, port: number) {
    this.client = new Redis({ host, port });
    this.client.on('error', (err) => {
      this.logger.error('Redis client error', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, serialized, 'EX', ttl);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  generateKey(prefix: string, ...args: any[]): string {
    return `${prefix}:${args.map((a) => JSON.stringify(a)).join(':')}`;
  }
}
```

- [ ] **Step 2: Create cache module**

Create `src/@shared/cache/cache.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AppConfigService } from '@shared/config';

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useFactory: (configService: AppConfigService) => {
        return new CacheService(configService.redisHost, configService.redisPort);
      },
      inject: [AppConfigService],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
```

- [ ] **Step 3: Create cacheable decorator**

Create `src/@shared/cache/cache.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache:metadata';

export interface CacheableOptions {
  ttl?: number;
  keyPrefix?: string;
}

export const Cacheable = (options: CacheableOptions = {}) =>
  SetMetadata(CACHE_KEY, {
    ttl: options.ttl || 300,
    keyPrefix: options.keyPrefix || '',
  });
```

- [ ] **Step 4: Create barrel export**

Create `src/@shared/cache/index.ts`:

```typescript
export * from './cache.module';
export * from './cache.service';
export * from './cache.decorator';
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add cache module with redis and cacheable decorator"
```

---

## Task 11: BullMQ Module for Job Queues

**Files:**

- Create: `src/@shared/queue/queue.module.ts`
- Create: `src/@shared/queue/queue.constants.ts`
- Create: `src/@shared/queue/index.ts`

- [ ] **Step 1: Create queue constants**

Create `src/@shared/queue/queue.constants.ts`:

```typescript
export const QUEUE_NAMES = {
  EMAIL: 'email',
  STORAGE: 'storage',
  AUDIT: 'audit',
  NOTIFICATION: 'notification',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
```

- [ ] **Step 2: Create queue module**

Create `src/@shared/queue/queue.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.STORAGE },
      { name: QUEUE_NAMES.AUDIT },
      { name: QUEUE_NAMES.NOTIFICATION },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

- [ ] **Step 3: Create barrel export**

Create `src/@shared/queue/index.ts`:

```typescript
export * from './queue.module';
export * from './queue.constants';
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add bullmq queue module with named queues"
```

---

## Task 12: Audit Log Decorator & Processor

**Files:**

- Create: `src/@shared/decorators/audit-log.decorator.ts`
- Create: `src/@shared/interceptors/audit.interceptor.ts`
- Create: `src/@shared/processors/audit-log.processor.ts`

- [ ] **Step 1: Create audit-log decorator**

Create `src/@shared/decorators/audit-log.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'audit:log';

export interface AuditLogOptions {
  action: string;
  entity: string;
}

export const AuditLog = (options: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options);
```

- [ ] **Step 2: Create audit interceptor**

Create `src/@shared/interceptors/audit.interceptor.ts`:

```typescript
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
    const userId = request['user']?.id || null;

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
          .catch(() => {
            // silently fail - don't block request
          });
      }),
    );
  }
}
```

- [ ] **Step 3: Create audit log processor**

Create `src/@shared/processors/audit-log.processor.ts`:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@shared/database';

@Processor('audit')
export class AuditLogProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { userId, action, entity, entityId, changes, timestamp } = job.data;

    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes || {},
        createdAt: new Date(timestamp),
      },
    });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add audit log decorator, interceptor, and bullmq processor"
```

---

## Task 13: User Module — Domain Layer

**Files:**

- Create: `src/modules/user/domain/value-objects/user-id.vo.ts`
- Create: `src/modules/user/domain/value-objects/email.vo.ts`
- Create: `src/modules/user/domain/entities/user.entity.ts`
- Create: `src/modules/user/domain/events/user-created.event.ts`
- Create: `src/modules/user/domain/repositories/user.repository.interface.ts`

- [ ] **Step 1: Create UserId value object**

Create `src/modules/user/domain/value-objects/user-id.vo.ts`:

```typescript
import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }

  static create(id?: string): UserId {
    return new UserId(id || randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

- [ ] **Step 2: Create Email value object**

Create `src/modules/user/domain/value-objects/email.vo.ts`:

```typescript
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {
    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
  }

  static create(email: string): Email {
    return new Email(email.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

- [ ] **Step 3: Create User domain entity**

Create `src/modules/user/domain/entities/user.entity.ts`:

```typescript
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private name: string | null,
    private avatarUrl: string | null,
    private role: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  static create(email: string, name?: string): User {
    const now = new Date();
    return new User(
      UserId.create(),
      Email.create(email),
      name || null,
      null,
      'user',
      now,
      now,
      null,
    );
  }

  static reconstitute(
    id: string,
    email: string,
    name: string | null,
    avatarUrl: string | null,
    role: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): User {
    return new User(
      UserId.create(id),
      Email.create(email),
      name,
      avatarUrl,
      role,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  getId(): string {
    return this.id.getValue();
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getName(): string | null {
    return this.name;
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  getRole(): string {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateAvatarUrl(avatarUrl: string): void {
    this.avatarUrl = avatarUrl;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  markDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
```

- [ ] **Step 4: Create UserCreated domain event**

Create `src/modules/user/domain/events/user-created.event.ts`:

```typescript
import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string | null,
  ) {}
}
```

- [ ] **Step 5: Create User repository interface (port)**

Create `src/modules/user/domain/repositories/user.repository.interface.ts`:

```typescript
import { User } from '../entities/user.entity';
import { PaginatedResult } from '@shared/pagination';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResult<User>>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add user domain layer - entity, value objects, events, repository port"
```

---

## Task 14: User Module — Application Layer (CQRS)

**Files:**

- Create: `src/modules/user/application/dtos/create-user.dto.ts`
- Create: `src/modules/user/application/dtos/update-user.dto.ts`
- Create: `src/modules/user/application/dtos/user-response.dto.ts`
- Create: `src/modules/user/application/commands/create-user/create-user.command.ts`
- Create: `src/modules/user/application/commands/create-user/create-user.handler.ts`
- Create: `src/modules/user/application/commands/update-user/update-user.command.ts`
- Create: `src/modules/user/application/commands/update-user/update-user.handler.ts`
- Create: `src/modules/user/application/queries/get-user/get-user.query.ts`
- Create: `src/modules/user/application/queries/get-user/get-user.handler.ts`
- Create: `src/modules/user/application/queries/list-users/list-users.query.ts`
- Create: `src/modules/user/application/queries/list-users/list-users.handler.ts`

- [ ] **Step 1: Create User DTOs**

Create `src/modules/user/application/dtos/create-user.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
```

Create `src/modules/user/application/dtos/update-user.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
```

Create `src/modules/user/application/dtos/user-response.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  avatarUrl: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create CreateUser command and handler**

Create `src/modules/user/application/commands/create-user/create-user.command.ts`:

```typescript
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name?: string,
  ) {}
}
```

Create `src/modules/user/application/commands/create-user/create-user.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { ConflictError } from '@shared/errors';
import { ErrorCode } from '@shared/errors';
import { User } from '../../../domain/entities/user.entity';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import { EventPublisher } from '@nestjs/cqrs';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictError('User with this email already exists', ErrorCode.USER_EMAIL_EXISTS);
    }

    const user = User.create(command.email, command.name);
    const savedUser = await this.userRepository.create(user);

    this.eventPublisher.mergeObjectContext(savedUser).commit();

    return savedUser.getId();
  }
}
```

Wait, `User` doesn't extend `AggregateRoot` from `@nestjs/cqrs`. Let me adjust the entity to support events properly. Actually, we'll handle events differently — we'll publish them via the EventBus directly in the handler rather than through the entity. This keeps the domain entity pure.

Create `src/modules/user/application/commands/create-user/create-user.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { ConflictError, ErrorCode } from '@shared/errors';
import { User } from '../../../domain/entities/user.entity';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictError('User with this email already exists', ErrorCode.USER_EMAIL_EXISTS);
    }

    const user = User.create(command.email, command.name);
    const savedUser = await this.userRepository.create(user);

    this.eventBus.publish(
      new UserCreatedEvent(savedUser.getId(), savedUser.getEmail(), savedUser.getName()),
    );

    return savedUser.getId();
  }
}
```

- [ ] **Step 3: Create UpdateUser command and handler**

Create `src/modules/user/application/commands/update-user/update-user.command.ts`:

```typescript
export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly avatarUrl?: string,
  ) {}
}
```

Create `src/modules/user/application/commands/update-user/update-user.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, string> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<string> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    if (command.name !== undefined) {
      user.updateName(command.name);
    }
    if (command.avatarUrl !== undefined) {
      user.updateAvatarUrl(command.avatarUrl);
    }

    await this.userRepository.update(user);
    return user.getId();
  }
}
```

- [ ] **Step 4: Create GetUser query and handler**

Create `src/modules/user/application/queries/get-user/get-user.query.ts`:

```typescript
export class GetUserQuery {
  constructor(public readonly id: string) {}
}
```

Create `src/modules/user/application/queries/get-user/get-user.handler.ts`:

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserResponseDto> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(query: GetUserQuery): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(query.id);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    return UserMapper.toResponseDto(user);
  }
}
```

- [ ] **Step 5: Create ListUsers query and handler**

Create `src/modules/user/application/queries/list-users/list-users.query.ts`:

```typescript
import { PaginationQueryDto } from '@shared/pagination';

export class ListUsersQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
```

Create `src/modules/user/application/queries/list-users/list-users.handler.ts`:

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './list-users.query';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import { PaginatedResult } from '@shared/pagination';
import { PaginationMeta } from '@shared/response';

interface ListUsersResult {
  items: UserResponseDto[];
  pagination: PaginationMeta;
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, ListUsersResult> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(query: ListUsersQuery): Promise<ListUsersResult> {
    const result = await this.userRepository.findAll(
      query.pagination.page || 1,
      query.pagination.limit || 10,
      query.pagination.sortBy,
      query.pagination.sortOrder,
    );

    const items = result.items.map((user) => UserMapper.toResponseDto(user));
    const totalPages = Math.ceil(result.pagination.totalItems / result.pagination.limit);

    return {
      items,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalItems: result.pagination.totalItems,
        totalPages,
        hasNext: result.pagination.page < totalPages,
        hasPrev: result.pagination.page > 1,
      },
    };
  }
}
```

Note: We reference `UserMapper` before creating it. We'll create it in the infrastructure task.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add user application layer - commands, queries, handlers, DTOs"
```

---

## Task 15: User Module — Infrastructure Layer

**Files:**

- Create: `src/modules/user/infrastructure/mappers/user.mapper.ts`
- Create: `src/modules/user/infrastructure/repositories/user.repository.impl.ts`
- Create: `src/modules/user/infrastructure/adapters/supabase-auth.adapter.ts`
- Create: `src/modules/user/infrastructure/processors/send-welcome-email.processor.ts`

- [ ] **Step 1: Create User mapper**

Create `src/modules/user/infrastructure/mappers/user.mapper.ts`:

```typescript
import { User } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.avatarUrl,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
    );
  }

  static toResponseDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.getId();
    dto.email = user.getEmail();
    dto.name = user.getName();
    dto.avatarUrl = user.getAvatarUrl();
    dto.role = user.getRole();
    dto.createdAt = user.getCreatedAt();
    dto.updatedAt = user.getUpdatedAt();
    return dto;
  }
}
```

- [ ] **Step 2: Create User repository implementation**

Create `src/modules/user/infrastructure/repositories/user.repository.impl.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { PaginatedResult } from '@shared/pagination';
import { getPaginationParams } from '@shared/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResult<User>> {
    const { skip, orderBy } = getPaginationParams({ page, limit, sortBy, sortOrder });
    const where: Prisma.UserWhereInput = { deletedAt: null };

    const [prismaUsers, totalItems] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.user.count({ where }),
    ]);

    const users = prismaUsers.map((u) => UserMapper.toDomain(u));
    return {
      items: users,
      pagination: { page, limit, totalItems },
    };
  }

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        role: user.getRole(),
      },
    });
    return UserMapper.toDomain(prismaUser);
  }

  async update(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        name: user.getName(),
        avatarUrl: user.getAvatarUrl(),
      },
    });
    return UserMapper.toDomain(prismaUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

- [ ] **Step 3: Create Supabase auth adapter**

Create `src/modules/user/infrastructure/adapters/supabase-auth.adapter.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@shared/supabase';
import { DomainError, ErrorCode } from '@shared/errors';

@Injectable()
export class SupabaseAuthAdapter {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(email: string, password: string): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new DomainError(
        `Failed to create auth user: ${error.message}`,
        ErrorCode.USER_EMAIL_EXISTS,
      );
    }

    return data.user.id;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabaseService.adminClient.auth.admin.deleteUser(userId);
    if (error) {
      throw new DomainError(
        `Failed to delete auth user: ${error.message}`,
        ErrorCode.USER_NOT_FOUND,
      );
    }
  }
}
```

- [ ] **Step 4: Create send welcome email processor**

Create `src/modules/user/infrastructure/processors/send-welcome-email.processor.ts`:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@shared/queue';

@Processor(QUEUE_NAMES.EMAIL)
export class SendWelcomeEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(SendWelcomeEmailProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    // In production, integrate with an email service (SendGrid, SES, etc.)
    // For now, we just log it
    this.logger.log(`Welcome email sent to user ${job.data.userId} at ${job.data.email}`);
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add user infrastructure layer - repository, mapper, auth adapter, email processor"
```

---

## Task 16: User Module — Presentation Layer & Module Wiring

**Files:**

- Create: `src/modules/user/presentation/user.controller.ts`
- Create: `src/modules/user/user.module.ts`

- [ ] **Step 1: Create User controller**

Create `src/modules/user/presentation/user.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { UpdateUserDto } from '../application/dtos/update-user.dto';
import { UserResponseDto } from '../application/dtos/user-response.dto';
import { CreateUserCommand } from '../application/commands/create-user/create-user.command';
import { UpdateUserCommand } from '../application/commands/update-user/update-user.command';
import { GetUserQuery } from '../application/queries/get-user/get-user.query';
import { ListUsersQuery } from '../application/queries/list-users/list-users.query';
import { PaginationQueryDto } from '@shared/pagination';
import { SupabaseAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { AuditLog } from '@shared/decorators/audit-log.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @AuditLog({ action: 'CREATE', entity: 'USER' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const id = await this.commandBus.execute(new CreateUserCommand(dto.email, dto.name));
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.queryBus.execute(new ListUsersQuery(pagination));
  }

  @Patch(':id')
  @AuditLog({ action: 'UPDATE', entity: 'USER' })
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.commandBus.execute(new UpdateUserCommand(id, dto.name, dto.avatarUrl));
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Delete(':id')
  @Roles('admin')
  @AuditLog({ action: 'DELETE', entity: 'USER' })
  @ApiOperation({ summary: 'Soft delete user' })
  async remove(@Param('id') id: string) {
    // We'll add DeleteUserCommand later or inline
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return user;
  }
}
```

- [ ] **Step 2: Create User module**

Create `src/modules/user/user.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { SendWelcomeEmailProcessor } from './infrastructure/processors/send-welcome-email.processor';
import { SupabaseAuthAdapter } from './infrastructure/adapters/supabase-auth.adapter';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    CreateUserHandler,
    UpdateUserHandler,
    GetUserHandler,
    ListUsersHandler,
    SupabaseAuthAdapter,
    SendWelcomeEmailProcessor,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add user presentation controller and module wiring"
```

---

## Task 17: Post Module — Domain Layer

**Files:**

- Create: `src/modules/post/domain/value-objects/slug.vo.ts`
- Create: `src/modules/post/domain/entities/post.entity.ts`
- Create: `src/modules/post/domain/events/post-published.event.ts`
- Create: `src/modules/post/domain/repositories/post.repository.interface.ts`

- [ ] **Step 1: Create Slug value object**

Create `src/modules/post/domain/value-objects/slug.vo.ts`:

```typescript
export class Slug {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Slug cannot be empty');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new Error(`Invalid slug format: ${value}`);
    }
  }

  static create(title: string): Slug {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return new Slug(slug);
  }

  static fromString(slug: string): Slug {
    return new Slug(slug);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

- [ ] **Step 2: Create Post domain entity**

Create `src/modules/post/domain/entities/post.entity.ts`:

```typescript
import { Slug } from '../value-objects/slug.vo';

export class Post {
  private constructor(
    private readonly id: string,
    private title: string,
    private slug: Slug,
    private content: string | null,
    private imageUrl: string | null,
    private published: boolean,
    private authorId: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private publishedAt: Date | null,
    private deletedAt: Date | null,
  ) {}

  static create(title: string, authorId: string, content?: string): Post {
    const now = new Date();
    return new Post(
      '', // id will be set by DB
      title,
      Slug.create(title),
      content || null,
      null,
      false,
      authorId,
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: string,
    title: string,
    slug: string,
    content: string | null,
    imageUrl: string | null,
    published: boolean,
    authorId: string,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
    deletedAt: Date | null,
  ): Post {
    return new Post(
      id,
      title,
      Slug.fromString(slug),
      content,
      imageUrl,
      published,
      authorId,
      createdAt,
      updatedAt,
      publishedAt,
      deletedAt,
    );
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getSlug(): string {
    return this.slug.getValue();
  }

  getContent(): string | null {
    return this.content;
  }

  getImageUrl(): string | null {
    return this.imageUrl;
  }

  isPublished(): boolean {
    return this.published;
  }

  getAuthorId(): string {
    return this.authorId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getPublishedAt(): Date | null {
    return this.publishedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  updateTitle(title: string): void {
    this.title = title;
    this.slug = Slug.create(title);
    this.updatedAt = new Date();
  }

  updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }

  setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  publish(): void {
    if (this.published) {
      throw new Error('Post is already published');
    }
    this.published = true;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  markDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
```

- [ ] **Step 3: Create PostPublished domain event**

Create `src/modules/post/domain/events/post-published.event.ts`:

```typescript
import { IEvent } from '@nestjs/cqrs';

export class PostPublishedEvent implements IEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
  ) {}
}
```

- [ ] **Step 4: Create Post repository interface (port)**

Create `src/modules/post/domain/repositories/post.repository.interface.ts`:

```typescript
import { Post } from '../entities/post.entity';
import { PaginatedResult } from '@shared/pagination';

export const POST_REPOSITORY = Symbol('POST_REPOSITORY');

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    authorId?: string,
    published?: boolean,
  ): Promise<PaginatedResult<Post>>;
  create(post: Post): Promise<Post>;
  update(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add post domain layer - entity, slug VO, events, repository port"
```

---

## Task 18: Post Module — Application Layer (CQRS)

**Files:**

- Create: `src/modules/post/application/dtos/create-post.dto.ts`
- Create: `src/modules/post/application/dtos/update-post.dto.ts`
- Create: `src/modules/post/application/dtos/post-response.dto.ts`
- Create: `src/modules/post/application/commands/create-post/create-post.command.ts`
- Create: `src/modules/post/application/commands/create-post/create-post.handler.ts`
- Create: `src/modules/post/application/commands/publish-post/publish-post.command.ts`
- Create: `src/modules/post/application/commands/publish-post/publish-post.handler.ts`
- Create: `src/modules/post/application/queries/get-post/get-post.query.ts`
- Create: `src/modules/post/application/queries/get-post/get-post.query.ts`
- Create: `src/modules/post/application/queries/get-post/get-post.handler.ts`
- Create: `src/modules/post/application/queries/list-posts/list-posts.query.ts`
- Create: `src/modules/post/application/queries/list-posts/list-posts.handler.ts`

- [ ] **Step 1: Create Post DTOs**

Create `src/modules/post/application/dtos/create-post.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Post content here...', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
```

Create `src/modules/post/application/dtos/update-post.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated Title', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ example: 'Updated content...', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
```

Create `src/modules/post/application/dtos/post-response.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  content: string | null;

  @ApiProperty({ required: false })
  imageUrl: string | null;

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  publishedAt: Date | null;
}
```

- [ ] **Step 2: Create CreatePost command and handler**

Create `src/modules/post/application/commands/create-post/create-post.command.ts`:

```typescript
export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly authorId: string,
    public readonly content?: string,
    public readonly imageUrl?: string,
  ) {}
}
```

Create `src/modules/post/application/commands/create-post/create-post.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePostCommand } from './create-post.command';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { Post } from '../../../domain/entities/post.entity';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand, string> {
  constructor(@Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const post = Post.create(command.title, command.authorId, command.content);

    if (command.imageUrl) {
      post.setImageUrl(command.imageUrl);
    }

    const savedPost = await this.postRepository.create(post);
    return savedPost.getId();
  }
}
```

- [ ] **Step 3: Create PublishPost command and handler**

Create `src/modules/post/application/commands/publish-post/publish-post.command.ts`:

```typescript
export class PublishPostCommand {
  constructor(public readonly id: string) {}
}
```

Create `src/modules/post/application/commands/publish-post/publish-post.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PublishPostCommand } from './publish-post.command';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { NotFoundError, DomainError, ErrorCode } from '@shared/errors';
import { PostPublishedEvent } from '../../../domain/events/post-published.event';
import { CacheService } from '@shared/cache';

@CommandHandler(PublishPostCommand)
export class PublishPostHandler implements ICommandHandler<PublishPostCommand, void> {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository,
    private readonly eventBus: EventBus,
    private readonly cacheService: CacheService,
  ) {}

  async execute(command: PublishPostCommand): Promise<void> {
    const post = await this.postRepository.findById(command.id);
    if (!post) {
      throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
    }

    if (post.isPublished()) {
      throw new DomainError('Post is already published', ErrorCode.POST_ALREADY_PUBLISHED);
    }

    post.publish();
    await this.postRepository.update(post);

    await this.cacheService.delByPattern('posts:*');
    await this.cacheService.del(`post:${post.getSlug()}`);

    this.eventBus.publish(new PostPublishedEvent(post.getId(), post.getAuthorId()));
  }
}
```

- [ ] **Step 4: Create GetPost query and handler**

Create `src/modules/post/application/queries/get-post/get-post.query.ts`:

```typescript
export class GetPostQuery {
  constructor(public readonly id: string) {}
}
```

Create `src/modules/post/application/queries/get-post/get-post.handler.ts`:

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPostQuery } from './get-post.query';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';
import { PostResponseDto } from '../../dtos/post-response.dto';
import { PostMapper } from '../../../infrastructure/mappers/post.mapper';

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery, PostResponseDto> {
  constructor(@Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository) {}

  async execute(query: GetPostQuery): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(query.id);
    if (!post) {
      throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
    }

    return PostMapper.toResponseDto(post);
  }
}
```

- [ ] **Step 5: Create ListPosts query and handler**

Create `src/modules/post/application/queries/list-posts/list-posts.query.ts`:

```typescript
import { PaginationQueryDto } from '@shared/pagination';

export class ListPostsQuery {
  constructor(
    public readonly pagination: PaginationQueryDto,
    public readonly authorId?: string,
    public readonly published?: boolean,
  ) {}
}
```

Create `src/modules/post/application/queries/list-posts/list-posts.handler.ts`:

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPostsQuery } from './list-posts.query';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { PostResponseDto } from '../../dtos/post-response.dto';
import { PostMapper } from '../../../infrastructure/mappers/post.mapper';
import { PaginationMeta } from '@shared/response';

interface ListPostsResult {
  items: PostResponseDto[];
  pagination: PaginationMeta;
}

@QueryHandler(ListPostsQuery)
export class ListPostsHandler implements IQueryHandler<ListPostsQuery, ListPostsResult> {
  constructor(@Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository) {}

  async execute(query: ListPostsQuery): Promise<ListPostsResult> {
    const result = await this.postRepository.findAll(
      query.pagination.page || 1,
      query.pagination.limit || 10,
      query.pagination.sortBy,
      query.pagination.sortOrder,
      query.authorId,
      query.published,
    );

    const items = result.items.map((post) => PostMapper.toResponseDto(post));
    const totalPages = Math.ceil(result.pagination.totalItems / result.pagination.limit);

    return {
      items,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalItems: result.pagination.totalItems,
        totalPages,
        hasNext: result.pagination.page < totalPages,
        hasPrev: result.pagination.page > 1,
      },
    };
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add post application layer - commands, queries, handlers, DTOs"
```

---

## Task 19: Post Module — Infrastructure Layer

**Files:**

- Create: `src/modules/post/infrastructure/mappers/post.mapper.ts`
- Create: `src/modules/post/infrastructure/repositories/post.repository.impl.ts`
- Create: `src/modules/post/infrastructure/adapters/supabase-storage.adapter.ts`
- Create: `src/modules/post/infrastructure/processors/process-image.processor.ts`

- [ ] **Step 1: Create Post mapper**

Create `src/modules/post/infrastructure/mappers/post.mapper.ts`:

```typescript
import { Post } from '../../domain/entities/post.entity';
import { Post as PrismaPost } from '@prisma/client';
import { PostResponseDto } from '../../application/dtos/post-response.dto';

export class PostMapper {
  static toDomain(prismaPost: PrismaPost): Post {
    return Post.reconstitute(
      prismaPost.id,
      prismaPost.title,
      prismaPost.slug,
      prismaPost.content,
      prismaPost.imageUrl,
      prismaPost.published,
      prismaPost.authorId,
      prismaPost.createdAt,
      prismaPost.updatedAt,
      prismaPost.publishedAt,
      prismaPost.deletedAt,
    );
  }

  static toResponseDto(post: Post): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.getId();
    dto.title = post.getTitle();
    dto.slug = post.getSlug();
    dto.content = post.getContent();
    dto.imageUrl = post.getImageUrl();
    dto.published = post.isPublished();
    dto.authorId = post.getAuthorId();
    dto.createdAt = post.getCreatedAt();
    dto.updatedAt = post.getUpdatedAt();
    dto.publishedAt = post.getPublishedAt();
    return dto;
  }
}
```

- [ ] **Step 2: Create Post repository implementation**

Create `src/modules/post/infrastructure/repositories/post.repository.impl.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostMapper } from '../mappers/post.mapper';
import { PaginatedResult } from '@shared/pagination';
import { getPaginationParams } from '@shared/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Post | null> {
    const prismaPost = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });
    if (!prismaPost) return null;
    return PostMapper.toDomain(prismaPost);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const prismaPost = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!prismaPost) return null;
    return PostMapper.toDomain(prismaPost);
  }

  async findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    authorId?: string,
    published?: boolean,
  ): Promise<PaginatedResult<Post>> {
    const { skip, orderBy } = getPaginationParams({ page, limit, sortBy, sortOrder });
    const where: Prisma.PostWhereInput = {
      deletedAt: null,
      ...(authorId && { authorId }),
      ...(published !== undefined && { published }),
    };

    const [prismaPosts, totalItems] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: limit, orderBy, include: { author: true } }),
      this.prisma.post.count({ where }),
    ]);

    const posts = prismaPosts.map((p) => PostMapper.toDomain(p));
    return {
      items: posts,
      pagination: { page, limit, totalItems },
    };
  }

  async create(post: Post): Promise<Post> {
    const prismaPost = await this.prisma.post.create({
      data: {
        title: post.getTitle(),
        slug: post.getSlug(),
        content: post.getContent(),
        imageUrl: post.getImageUrl(),
        published: post.isPublished(),
        authorId: post.getAuthorId(),
      },
    });
    return PostMapper.toDomain(prismaPost);
  }

  async update(post: Post): Promise<Post> {
    const prismaPost = await this.prisma.post.update({
      where: { id: post.getId() },
      data: {
        title: post.getTitle(),
        slug: post.getSlug(),
        content: post.getContent(),
        imageUrl: post.getImageUrl(),
        published: post.isPublished(),
        publishedAt: post.getPublishedAt(),
      },
    });
    return PostMapper.toDomain(prismaPost);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

- [ ] **Step 3: Create Supabase storage adapter for posts**

Create `src/modules/post/infrastructure/adapters/supabase-storage.adapter.ts`:

Note: We already have `SupabaseStorageAdapter` implementing `StoragePort` in the shared module. This file provides a module-specific service that uses the port.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { STORAGE_PORT, StoragePort } from '@shared/supabase';

@Injectable()
export class PostStorageService {
  constructor(@Inject(STORAGE_PORT) private readonly storagePort: StoragePort) {}

  async uploadImage(file: Buffer, filename: string, contentType: string): Promise<string> {
    const path = `posts/${Date.now()}-${filename}`;
    return this.storagePort.upload('post-images', path, file, contentType);
  }

  async deleteImage(path: string): Promise<void> {
    return this.storagePort.delete('post-images', path);
  }
}
```

- [ ] **Step 4: Create process image processor**

Create `src/modules/post/infrastructure/processors/process-image.processor.ts`:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '@shared/queue';

@Processor(QUEUE_NAMES.STORAGE)
export class ProcessImageProcessor extends WorkerHost {
  private readonly logger = new Logger(ProcessImageProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing image: ${job.data.filename}`);
    // In production, add image optimization/resizing here
    // e.g., sharp, imagemagick, etc.
    this.logger.log(`Image processed: ${job.data.filename}`);
  }
}
```

- [ ] **Step 5: Create PostPublished event handler**

Create `src/modules/post/application/events/post-published.handler.ts`:

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PostPublishedEvent } from '../../domain/events/post-published.event';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@shared/queue';

@EventsHandler(PostPublishedEvent)
export class PostPublishedHandler implements IEventHandler<PostPublishedEvent> {
  private readonly logger = new Logger(PostPublishedHandler.name);

  constructor(@InjectQueue(QUEUE_NAMES.NOTIFICATION) private readonly notificationQueue: Queue) {}

  async handle(event: PostPublishedEvent) {
    this.logger.log(`Post published: ${event.postId} by author ${event.authorId}`);
    await this.notificationQueue.add('post-published-notification', {
      postId: event.postId,
      authorId: event.authorId,
    });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add post infrastructure layer - repository, mapper, storage service, processors"
```

---

## Task 20: Post Module — Presentation Layer & Module Wiring

**Files:**

- Create: `src/modules/post/presentation/post.controller.ts`
- Create: `src/modules/post/user.module.ts` (actually `post.module.ts`)

- [ ] **Step 1: Create Post controller**

Create `src/modules/post/presentation/post.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreatePostDto } from '../application/dtos/create-post.dto';
import { UpdatePostDto } from '../application/dtos/update-post.dto';
import { PostResponseDto } from '../application/dtos/post-response.dto';
import { CreatePostCommand } from '../application/commands/create-post/create-post.command';
import { PublishPostCommand } from '../application/commands/publish-post/publish-post.command';
import { GetPostQuery } from '../application/queries/get-post/get-post.query';
import { ListPostsQuery } from '../application/queries/list-posts/list-posts.query';
import { PaginationQueryDto } from '@shared/pagination';
import { SupabaseAuthGuard } from '@shared/guards/auth.guard';
import { AuditLog } from '@shared/decorators/audit-log.decorator';
import { PostStorageService } from '../infrastructure/adapters/supabase-storage.adapter';
import { SkipTransform } from '@shared/decorators/skip-transform.decorator';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(SupabaseAuthGuard)
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly postStorageService: PostStorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponse({ type: PostResponseDto })
  @AuditLog({ action: 'CREATE', entity: 'POST' })
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.postStorageService.uploadImage(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    }

    const id = await this.commandBus.execute(
      new CreatePostCommand(dto.title, '', dto.content, imageUrl),
    );
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiOkResponse({ type: PostResponseDto })
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'List posts with pagination' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.queryBus.execute(new ListPostsQuery(pagination));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    // For simplicity, future: add UpdatePostCommand
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Patch(':id/publish')
  @AuditLog({ action: 'PUBLISH', entity: 'POST' })
  @ApiOperation({ summary: 'Publish a post' })
  async publish(@Param('id') id: string) {
    await this.commandBus.execute(new PublishPostCommand(id));
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Delete(':id')
  @AuditLog({ action: 'DELETE', entity: 'POST' })
  @ApiOperation({ summary: 'Soft delete a post' })
  async remove(@Param('id') id: string) {
    // For simplicity, add DeletePostCommand in future
    return this.queryBus.execute(new GetPostQuery(id));
  }
}
```

- [ ] **Step 2: Create Post module**

Create `src/modules/post/post.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostController } from './presentation/post.controller';
import { POST_REPOSITORY } from './domain/repositories/post.repository.interface';
import { PostRepositoryImpl } from './infrastructure/repositories/post.repository.impl';
import { CreatePostHandler } from './application/commands/create-post/create-post.handler';
import { PublishPostHandler } from './application/commands/publish-post/publish-post.handler';
import { GetPostHandler } from './application/queries/get-post/get-post.handler';
import { ListPostsHandler } from './application/queries/list-posts/list-posts.handler';
import { PostPublishedHandler } from './application/events/post-published.handler';
import { PostStorageService } from './infrastructure/adapters/supabase-storage.adapter';
import { ProcessImageProcessor } from './infrastructure/processors/process-image.processor';

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [
    { provide: POST_REPOSITORY, useClass: PostRepositoryImpl },
    CreatePostHandler,
    PublishPostHandler,
    GetPostHandler,
    ListPostsHandler,
    PostPublishedHandler,
    PostStorageService,
    ProcessImageProcessor,
  ],
  exports: [POST_REPOSITORY],
})
export class PostModule {}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add post presentation controller and module wiring"
```

---

## Task 21: App Module & Main.ts (Bootstrap)

**Files:**

- Create: `src/@shared/shared.module.ts`
- Modify: `src/app.module.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create SharedModule that bundles all shared concerns**

Create `src/@shared/shared.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { LoggingModule } from './logging';
import { PrismaModule } from './database';
import { SupabaseModule } from './supabase';
import { CacheModule } from './cache';
import { QueueModule } from './queue';

@Global()
@Module({
  imports: [ConfigModule, LoggingModule, PrismaModule, SupabaseModule, CacheModule, QueueModule],
  exports: [ConfigModule, LoggingModule, PrismaModule, SupabaseModule, CacheModule, QueueModule],
})
export class SharedModule {}
```

- [ ] **Step 2: Create App Module**

Replace `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SharedModule } from './@shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { AllExceptionsFilter } from './@shared/filters/all-exceptions.filter';
import { TransformInterceptor } from './@shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './@shared/interceptors/logging.interceptor';
import { AuditInterceptor } from './@shared/interceptors/audit.interceptor';
import { AppConfigService } from './@shared/config';
import { AuditLogProcessor } from './@shared/processors/audit-log.processor';

@Module({
  imports: [
    ConfigModule,
    SharedModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    UserModule,
    PostModule,
  ],
  providers: [
    AuditLogProcessor,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
```

Note: We don't register `AuditInterceptor` globally since it only applies to endpoints with `@AuditLog()` — actually, the interceptor checks for the metadata and passes through if not present, so we can register it globally.

Add `AuditInterceptor` to the providers:

```typescript
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
```

- [ ] **Step 3: Create main.ts**

Replace `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './@shared/config';
import { RequestIdMiddleware } from './@shared/middleware/request-id.middleware';
import { AllExceptionsFilter } from './@shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);

  app.use(helmet());
  app.enableCors({ origin: configService.corsOrigin });

  app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.swaggerTitle)
    .setDescription(configService.swaggerDescription)
    .setVersion(configService.swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.port);
  console.log(`Application running on port ${configService.port}`);
  console.log(`Swagger docs: http://localhost:${configService.port}/api/docs`);
}
bootstrap();
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add app module, main.ts bootstrap, global interceptors, swagger setup"
```

---

## Task 22: User Event Handler & Delete Command

**Files:**

- Create: `src/modules/user/application/events/user-created.handler.ts`
- Create: `src/modules/user/application/commands/delete-user/delete-user.command.ts`
- Create: `src/modules/user/application/commands/delete-user/delete-user.handler.ts`
- Modify: `src/modules/user/user.module.ts`

This task fills in missing pieces: the event handler for `UserCreatedEvent` and the `DeleteUserCommand`.

- [ ] **Step 1: Create UserCreated event handler**

Create `src/modules/user/application/events/user-created.handler.ts`:

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@shared/queue';
import { Logger } from '@nestjs/common';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(@InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue) {}

  async handle(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.userId} - ${event.email}`);
    await this.emailQueue.add('send-welcome-email', {
      userId: event.userId,
      email: event.email,
      name: event.name,
    });
  }
}
```

- [ ] **Step 2: Create DeleteUser command and handler**

Create `src/modules/user/application/commands/delete-user/delete-user.command.ts`:

```typescript
export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}
```

Create `src/modules/user/application/commands/delete-user/delete-user.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }
    await this.userRepository.delete(command.id);
  }
}
```

- [ ] **Step 3: Update User module to include new handlers and update controller**

Update `src/modules/user/user.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { UserCreatedHandler } from './application/events/user-created.handler';
import { SendWelcomeEmailProcessor } from './infrastructure/processors/send-welcome-email.processor';
import { SupabaseAuthAdapter } from './infrastructure/adapters/supabase-auth.adapter';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserHandler,
    ListUsersHandler,
    UserCreatedHandler,
    SupabaseAuthAdapter,
    SendWelcomeEmailProcessor,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
```

- [ ] **Step 4: Update User controller to add delete endpoint**

Update `src/modules/user/presentation/user.controller.ts` — add the `DeleteUserCommand` import and the delete handler:

```typescript
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/commands/create-user/create-user.command';
import { UpdateUserCommand } from '../application/commands/update-user/update-user.command';
import { DeleteUserCommand } from '../application/commands/delete-user/delete-user.command';
```

And replace the `remove` method:

```typescript
  @Delete(':id')
  @Roles('admin')
  @AuditLog({ action: 'DELETE', entity: 'USER' })
  @ApiOperation({ summary: 'Soft delete user' })
  async remove(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add user event handler, delete command, update module wiring"
```

---

## Task 23: Barrel Exports & @shared Index

**Files:**

- Create: `src/@shared/index.ts`

- [ ] **Step 1: Create shared barrel export**

Create `src/@shared/index.ts`:

```typescript
export * from './errors';
export * from './response';
export * from './pagination';
export * from './config';
export * from './logging';
export * from './database';
export * from './supabase';
export * from './cache';
export * from './queue';
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add barrel exports for @shared module"
```

---

## Task 24: Testing Infrastructure & Example Tests

**Files:**

- Create: `src/@shared/testing/test-app.factory.ts`
- Create: `src/@shared/testing/mock-providers.ts`
- Create: `src/modules/user/domain/entities/user.entity.spec.ts`
- Create: `src/modules/user/domain/value-objects/email.vo.spec.ts`
- Create: `src/modules/user/application/commands/create-user/create-user.handler.spec.ts`

- [ ] **Step 1: Create test app factory**

Create `src/@shared/testing/test-app.factory.ts`:

```typescript
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
```

- [ ] **Step 2: Create mock providers**

Create `src/@shared/testing/mock-providers.ts`:

```typescript
import { IUserRepository } from '../../modules/user/domain/repositories/user.repository.interface';
import { IPostRepository } from '../../modules/post/domain/repositories/post.repository.interface';
import { USER_REPOSITORY, POST_REPOSITORY } from '@shared/errors';

export const mockUserRepository: Partial<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPostRepository: Partial<IPostRepository> = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const provideMockUserRepo = () => ({
  provide: USER_REPOSITORY,
  useValue: mockUserRepository,
});

export const provideMockPostRepo = () => ({
  provide: POST_REPOSITORY,
  useValue: mockPostRepository,
});
```

Wait, `USER_REPOSITORY` and `POST_REPOSITORY` are not in the errors module. Let me fix the import paths:

```typescript
import { IUserRepository } from '../../modules/user/domain/repositories/user.repository.interface';
import { IPostRepository } from '../../modules/post/domain/repositories/post.repository.interface';
import { USER_REPOSITORY } from '../../modules/user/domain/repositories/user.repository.interface';
import { POST_REPOSITORY } from '../../modules/post/domain/repositories/post.repository.interface';

export const mockUserRepository: Partial<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPostRepository: Partial<IPostRepository> = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const provideMockUserRepo = () => ({
  provide: USER_REPOSITORY,
  useValue: mockUserRepository,
});

export const provideMockPostRepo = () => ({
  provide: POST_REPOSITORY,
  useValue: mockPostRepository,
});
```

- [ ] **Step 3: Create User entity unit test**

Create `src/modules/user/domain/entities/user.entity.spec.ts`:

```typescript
import { User } from './user.entity';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create('john@example.com', 'John Doe');
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getName()).toBe('John Doe');
      expect(user.getRole()).toBe('user');
      expect(user.isDeleted()).toBe(false);
    });

    it('should create a user without name', () => {
      const user = User.create('jane@example.com');
      expect(user.getEmail()).toBe('jane@example.com');
      expect(user.getName()).toBeNull();
    });
  });

  describe('updateName', () => {
    it('should update user name', () => {
      const user = User.create('john@example.com', 'John');
      user.updateName('John Updated');
      expect(user.getName()).toBe('John Updated');
    });
  });

  describe('markDeleted', () => {
    it('should mark user as deleted', () => {
      const user = User.create('john@example.com', 'John');
      user.markDeleted();
      expect(user.isDeleted()).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user from persistence', () => {
      const now = new Date();
      const user = User.reconstitute(
        'user-id',
        'john@example.com',
        'John Doe',
        null,
        'admin',
        now,
        now,
        null,
      );
      expect(user.getId()).toBe('user-id');
      expect(user.getEmail()).toBe('john@example.com');
      expect(user.getRole()).toBe('admin');
    });
  });
});
```

- [ ] **Step 4: Create Email value object unit test**

Create `src/modules/user/domain/value-objects/email.vo.spec.ts`:

```typescript
import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('John@Example.COM');
      expect(email.getValue()).toBe('john@example.com');
    });

    it('should throw for invalid email', () => {
      expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('should throw for empty email', () => {
      expect(() => Email.create('')).toThrow('Invalid email format');
    });
  });

  describe('equals', () => {
    it('should return true for same emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
```

- [ ] **Step 5: Create CreateUser handler unit test**

Create `src/modules/user/application/commands/create-user/create-user.handler.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from './create-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { ConflictError } from '@shared/errors';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepo: Partial<IUserRepository> = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [CreateUserHandler, { provide: USER_REPOSITORY, useValue: mockRepo }],
    }).compile();

    handler = module.get(CreateUserHandler);
    userRepository = module.get(USER_REPOSITORY);
  });

  it('should create a user successfully', async () => {
    userRepository.findByEmail!.mockResolvedValue(null);
    const user = User.create('john@example.com', 'John Doe');
    userRepository.create!.mockResolvedValue(user);

    const id = await handler.execute(new CreateUserCommand('john@example.com', 'John Doe'));

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictError if email exists', async () => {
    const existingUser = User.create('john@example.com', 'John');
    userRepository.findByEmail!.mockResolvedValue(existingUser);

    await expect(
      handler.execute(new CreateUserCommand('john@example.com', 'John Doe')),
    ).rejects.toThrow(ConflictError);
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add testing infrastructure and unit tests for user module"
```

---

## Task 25: Final Polish — Scripts, .env, Linting

**Files:**

- Modify: `package.json` (scripts)
- Copy: `.env.example` → `.env` (for development)

- [ ] **Step 1: Update package.json scripts**

Ensure the `scripts` section in `package.json` includes:

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

- [ ] **Step 2: Copy .env.example to .env for local development**

```bash
cp .env.example .env
```

- [ ] **Step 3: Create e2e test config**

Create `test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@shared/(.*)$": "<rootDir>/../src/@shared/$1",
    "^@modules/(.*)$": "<rootDir>/../src/modules/$1",
    "^@config$": "<rootDir>/../src/@shared/config"
  }
}
```

- [ ] **Step 4: Create a basic e2e test**

Create `test/app.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('application should be defined', () => {
    expect(app).toBeDefined();
  });
});
```

- [ ] **Step 5: Verify the project compiles**

```bash
npx nest build
```

Expected: Build succeeds with no errors (or only path alias related warnings).

- [ ] **Step 6: Run unit tests**

```bash
npm run test
```

Expected: Domain value object and entity tests pass.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: add scripts, e2e test config, env setup, finalize boilerplate"
```

---

## Summary

This plan creates a production-ready NestJS DDD Hexagonal Boilerplate with:

| Task | Component                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 1    | Project scaffolding, dependencies, path aliases                                                        |
| 2    | Error classes & error catalog                                                                          |
| 3    | Standard response format (ApiResponse, PaginatedResponse, ApiErrorResponse)                            |
| 4    | Config module with Zod validation                                                                      |
| 5    | Logging module with nestjs-pino                                                                        |
| 6    | Middleware (request ID), interceptors (transform, logging), filters (exceptions), guards (auth, roles) |
| 7    | Pagination DTOs & utilities                                                                            |
| 8    | Prisma schema & service                                                                                |
| 9    | Supabase module (auth, DB, storage port)                                                               |
| 10   | Cache module with Redis                                                                                |
| 11   | BullMQ queue module                                                                                    |
| 12   | Audit log decorator & processor                                                                        |
| 13   | User module - domain layer                                                                             |
| 14   | User module - application layer (CQRS)                                                                 |
| 15   | User module - infrastructure layer                                                                     |
| 16   | User module - presentation & wiring                                                                    |
| 17   | Post module - domain layer                                                                             |
| 18   | Post module - application layer (CQRS)                                                                 |
| 19   | Post module - infrastructure layer                                                                     |
| 20   | Post module - presentation & wiring                                                                    |
| 21   | App module & main.ts bootstrap                                                                         |
| 22   | User event handler & delete command                                                                    |
| 23   | Barrel exports                                                                                         |
| 24   | Testing infrastructure & examples                                                                      |
| 25   | Final polish — scripts, e2e config, build verification                                                 |
