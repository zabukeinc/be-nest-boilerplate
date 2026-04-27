# NestJS DDD Hexagonal Boilerplate — Design Spec

## Overview

A production-ready NestJS + TypeScript boilerplate using Domain-Driven Design (DDD), Hexagonal Architecture (Ports & Adapters), CQRS, and SOLID principles. Designed as a reusable foundation for multiple API backend projects (mobile/web), with Supabase integration and strong foundation patterns.

## Architecture: Strict Hexagonal + DDD (Approach A)

Each domain module is self-contained with four layers following hexagonal architecture:

```
domain/          → Entities, Value Objects, Domain Events, Repository Interfaces (Ports)
application/     → Commands, Queries, Handlers, DTOs (Use Cases)
infrastructure/  → Repository Implementations (Adapters), External Service Adapters, Mappers, Processors
presentation/    → Controllers, Swagger Decorators
```

Dependencies flow inward: `presentation → application → domain`. `infrastructure` implements `domain`'s port interfaces. No domain layer depends on NestJS or external libraries.

## Folder Structure

```
src/
├── @shared/                              # Cross-cutting concerns
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── config.schema.ts              # Zod validation for env vars
│   │   └── config.service.ts
│   ├── errors/
│   │   ├── app.error.ts                  # Base AppError class
│   │   ├── not-found.error.ts
│   │   ├── validation.error.ts
│   │   ├── unauthorized.error.ts
│   │   ├── forbidden.error.ts
│   │   ├── conflict.error.ts
│   │   └── domain.error.ts               # Business rule violations (422)
│   ├── logging/
│   │   ├── logging.module.ts
│   │   └── logging.service.ts            # Pino-based structured logging
│   ├── response/
│   │   ├── response.interface.ts         # ApiResponse<T>, PaginatedResponse<T>
│   │   └── response.factory.ts           # success(), error(), paginated()
│   ├── pagination/
│   │   ├── pagination.dto.ts             # PaginationQuery, PaginatedResult
│   │   └── pagination.utils.ts
│   ├── decorators/
│   │   ├── audit-log.decorator.ts
│   │   └── cache.decorator.ts
│   ├── guards/
│   │   ├── auth.guard.ts                 # Supabase JWT validation
│   │   └── throttler.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts      # Wraps response in ApiResponse
│   │   ├── logging.interceptor.ts        # Request/response structured logs
│   │   └── audit.interceptor.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts      # Global exception → ApiErrorResponse
│   ├── middleware/
│   │   └── request-id.middleware.ts       # Generates requestId per request
│   └── testing/
│       ├── factory.ts                    # Test data factories
│       └── mock-providers.ts             # Common mock providers
│
├── modules/
│   ├── user/                             # Example module 1
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts        # Pure domain entity
│   │   │   ├── value-objects/
│   │   │   │   ├── email.vo.ts
│   │   │   │   └── user-id.vo.ts
│   │   │   ├── events/
│   │   │   │   └── user-created.event.ts
│   │   │   └── repositories/
│   │   │       └── user.repository.interface.ts  # Port
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-user/
│   │   │   │   │   ├── create-user.command.ts
│   │   │   │   │   └── create-user.handler.ts
│   │   │   │   └── update-user/
│   │   │   │       ├── update-user.command.ts
│   │   │   │       └── update-user.handler.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-user/
│   │   │   │   │   ├── get-user.query.ts
│   │   │   │   │   └── get-user.handler.ts
│   │   │   │   └── list-users/
│   │   │   │       ├── list-users.query.ts
│   │   │   │       └── list-users.handler.ts
│   │   │   └── dtos/
│   │   │       ├── create-user.dto.ts    # @ApiProperty + class-validator
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.impl.ts  # Adapter (Prisma)
│   │   │   ├── adapters/
│   │   │   │   └── supabase-auth.adapter.ts
│   │   │   ├── mappers/
│   │   │   │   └── user.mapper.ts       # Prisma model ↔ Domain entity
│   │   │   └── processors/
│   │   │       └── send-welcome-email.processor.ts  # BullMQ
│   │   ├── presentation/
│   │   │   └── user.controller.ts
│   │   └── user.module.ts
│   │
│   └── post/                             # Example module 2
│       ├── domain/
│       │   ├── entities/
│       │   │   └── post.entity.ts
│       │   ├── value-objects/
│       │   │   └── slug.vo.ts
│       │   ├── events/
│       │   │   └── post-published.event.ts
│       │   └── repositories/
│       │       └── post.repository.interface.ts
│       ├── application/
│       │   ├── commands/
│       │   │   ├── create-post/
│       │   │   │   ├── create-post.command.ts
│       │   │   │   └── create-post.handler.ts
│       │   │   └── publish-post/
│       │   │       ├── publish-post.command.ts
│       │   │       └── publish-post.handler.ts
│       │   ├── queries/
│       │   │   ├── get-post/
│       │   │   │   ├── get-post.query.ts
│       │   │   │   └── get-post.handler.ts
│       │   │   └── list-posts/
│       │   │       ├── list-posts.query.ts
│       │   │       └── list-posts.handler.ts
│       │   └── dtos/
│       │       ├── create-post.dto.ts
│       │       ├── update-post.dto.ts
│       │       └── post-response.dto.ts
│       ├── infrastructure/
│       │   ├── repositories/
│       │   │   └── post.repository.impl.ts
│       │   ├── adapters/
│       │   │   └── supabase-storage.adapter.ts  # File upload adapter
│       │   ├── mappers/
│       │   │   └── post.mapper.ts
│       │   └── processors/
│       │       └── process-image.processor.ts
│       ├── presentation/
│       │   └── post.controller.ts
│       └── post.module.ts
│
├── app.module.ts
└── main.ts
```

## Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["src/@shared/*"],
      "@modules/*": ["src/modules/*"],
      "@config": ["src/@shared/config"]
    },
    "baseUrl": "."
  }
}
```

Also configured in `nest-cli.json` for NestJS compiler and `jest.config.ts` for test resolution.

## Standard Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;       // e.g. "USER_NOT_FOUND", "VALIDATION_FAILED"
    details?: any;      // validation errors array, field-level errors
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

## Error Handling

### Error Hierarchy

```
AppError (base)
├── NotFoundError          → 404
├── ValidationError         → 400
├── UnauthorizedError      → 401
├── ForbiddenError         → 403
├── ConflictError          → 409
└── DomainError            → 422 (business rule violations)
```

Each error has: `code` (from ErrorCode enum), `message`, `statusCode`, optional `details`.

### Error Flow

1. Domain/application layer throws typed `AppError` subclasses
2. `AllExceptionsFilter` catches all errors
3. Filter logs via `LoggingService`, returns `ApiErrorResponse`
4. Unknown errors are logged as 500 with generic message (no leak)
5. `TransformInterceptor` wraps successful responses into `ApiResponse`

### Request ID Middleware

Every request gets a `requestId` (UUID) attached via middleware. This ID propagates to logs, responses, and background jobs for traceability.

## Swagger / OpenAPI

- `@nestjs/swagger` with `SwaggerModule` setup
- NestJS Swagger plugin auto-generates schemas from DTOs (no manual schema definitions)
- DTOs use `@ApiProperty()` alongside `class-validator` decorators
- `@ApiTags()` per controller for grouped documentation
- `@ApiBearerAuth()` for protected endpoints
- `@ApiOkResponse()`, `@ApiCreatedResponse()`, `@ApiNotFoundResponse()` etc. reference DTO types
- Available at `/api/docs` in development

## CQRS (@nestjs/cqrs)

### Commands (Write Side)
- Mutate state, return ID or void
- Named: `{Verb}{Entity}Command` (e.g., `CreateUserCommand`)
- Handler: `{Verb}{Entity}Handler`
- Throw `DomainError` for business rule violations

### Queries (Read Side)
- Read-only, return data
- Named: `{Verb}{Entity}Query` (e.g., `GetUserQuery`)
- Handler: `{Verb}{Entity}Handler`
- Support pagination via `PaginationQuery` DTO

### Domain Events
- Emitted from entities after state changes
- Named: `{Entity}{PastTenseVerb}Event` (e.g., `UserCreatedEvent`)
- Handled by `EventPublisher` → NestJS `EventEmitter2` (synchronous)
- Side effects (email, notifications) dispatched to BullMQ queues

## Logging (nestjs-pino)

- Structured JSON logs in production, pretty-print in development
- Request context: `requestId`, `userId`, `method`, `url`, `duration`, `statusCode`
- `LoggingService` wraps Pino for use in services/handlers
- `LoggingInterceptor` auto-logs all HTTP request/response cycles
- Log levels configured via environment variable (`LOG_LEVEL`)

## Job Queues (BullMQ + Redis)

- Named queues: `email`, `storage`, `audit`, `notification`
- Processors live in each module's `infrastructure/processors/`
- Retry strategies: exponential backoff, max 3 retries
- Dead-letter handling for permanently failed jobs
- BullBoard dashboard available at `/admin/queues` in development

## Caching (Redis)

- `@cacheable()` decorator for query handlers
- Cache invalidation triggered by domain events via EventEmitter
- TTL configurable per decorator call: `@cacheable({ ttl: 300 })`
- Cache keys auto-generated from handler class + input params
- `CacheModule` wraps `@nestjs/cache-manager` + `ioredis`

## Audit Trail

- `@AuditLog()` decorator on command handlers
- Automatically writes to `audit_logs` Prisma table
- Fields: `id`, `userId`, `action`, `entity`, `entityId`, `changes` (JSON), `timestamp`
- Dispatched as BullMQ job to avoid blocking request cycle
- Soft-delete support via `deletedAt` column on entities

## Security

- `helmet` for HTTP security headers
- `@nestjs/throttler` for rate limiting
- CORS configured via env (`CORS_ORIGIN`)
- `AuthGuard` validates Supabase JWT tokens, extracts `userId` + `roles`
- Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`
- RBAC via roles from JWT custom claims (e.g., `@Roles('admin')` decorator)

## Supabase Integration

- **Auth:** `SupabaseAuthGuard` validates JWT, attaches `user` to request
- **DB:** Prisma connects to Supabase PostgreSQL directly
- **Storage:** `StoragePort` interface in domain, `SupabaseStorageAdapter` in infrastructure
- **Client:** `SupabaseModule` initializes client with service role key (env var)

### File Upload Flow

1. Controller receives multipart file via `@UseInterceptors(FileInterceptor)`
2. `FileValidationInterceptor` validates mime type, size
3. `CreatePostCommand` includes file metadata
4. `CreatePostHandler` calls `StoragePort.upload()`
5. `SupabaseStorageAdapter` uploads to Supabase Storage bucket
6. File URL stored in entity, returned in response

## Configuration

- NestJS `ConfigModule` with `@nestjs/config`
- Zod schema validates all env vars at startup (fails fast on missing/invalid)
- All config typed via `ConfigService` with generic types
- Required env vars: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, etc.

## Testing Strategy

### Unit Tests
- Domain entities, value objects, mappers — pure logic, no NestJS
- Command/query handlers — mock repository ports
- Co-located: `user.entity.spec.ts` next to `user.entity.ts`

### Integration Tests
- Repository implementations with test Supabase DB or Prisma mock
- Each module test validates full DI container wiring

### E2E Tests
- Full request → response lifecycle via Supertest
- Test app created per test suite with module overrides
- Shared test utilities: `@shared/testing/factory.ts`, `mock-providers.ts`

### Test Commands
- `npm run test` — unit tests
- `npm run test:watch` — watch mode
- `npm run test:cov` — coverage report
- `npm run test:e2e` — end-to-end tests

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10+ with TypeScript |
| ORM | Prisma (Supabase PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Validation | class-validator + class-transformer + Zod (env) |
| Swagger | @nestjs/swagger (auto-schema from DTOs) |
| CQRS | @nestjs/cqrs |
| Queue | BullMQ + Redis |
| Cache | @nestjs/cache-manager + ioredis |
| Logging | nestjs-pino (structured JSON) |
| Testing | Jest + Supertest |
| Security | helmet, @nestjs/throttler, CORS |

## Example Modules

### Module 1: User
- CRUD operations with Supabase Auth integration
- Email value object with validation
- `CreateUserCommand` → creates user in Supabase Auth + DB
- `UserCreatedEvent` → sends welcome email via BullMQ
- Demonstrates: CQRS, domain events, auth guard, repository pattern

### Module 2: Post
- CRUD + publish workflow with image upload
- Slug value object for URL-friendly identifiers
- `CreatePostCommand` with image upload via Supabase Storage
- `PublishPostCommand` → domain event → cache invalidation
- `ListPostsQuery` → demonstrates pagination
- Demonstrates: file upload, domain state transitions, caching, pagination

## Key NPM Scripts

- `npm run dev` / `npm run start:dev` — hot reload development
- `npm run build` — compile TypeScript
- `npm run start:prod` — production mode
- `npm run test` — unit tests
- `npm run test:watch` — watch mode
- `npm run test:cov` — coverage
- `npm run test:e2e` — e2e tests
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — run migrations
- `npm run prisma:studio` — Prisma admin