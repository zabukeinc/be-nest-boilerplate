# NestJS DDD Hexagonal Boilerplate

Production-ready NestJS boilerplate with Domain-Driven Design, Hexagonal Architecture, CQRS, and Supabase integration. Built for reuse across multiple API backend projects.

## Architecture

**Strict Hexagonal + DDD** — each module follows the ports & adapters pattern with four layers:

```
domain/          → Entities, Value Objects, Events, Repository Interfaces (Ports)
application/     → Commands, Queries, Handlers, DTOs (Use Cases)
infrastructure/  → Repository Implementations (Adapters), External Services, Mappers, Processors
presentation/    → Controllers
```

Dependencies flow inward: `presentation → application → domain`. Infrastructure implements domain's port interfaces. The domain layer has zero external dependencies.

## Project Structure

```
src/
├── @shared/                              # Cross-cutting concerns
│   ├── cache/                            # Redis caching service & decorator
│   ├── config/                           # Zod-validated env config
│   ├── database/                         # Prisma service & module
│   ├── decorators/                       # @AuditLog, @Roles, @SkipTransform, @Cacheable
│   ├── errors/                           # AppError hierarchy & error catalog
│   ├── filters/                          # Global exception filter
│   ├── guards/                           # SupabaseAuthGuard, RolesGuard, ThrottlerGuard
│   ├── interceptors/                     # Transform, Logging, Audit interceptors
│   ├── logging/                          # Pino structured logging
│   ├── middleware/                       # RequestId middleware
│   ├── pagination/                       # Pagination DTOs & utilities
│   ├── processors/                      # Audit log BullMQ processor
│   ├── queue/                            # BullMQ named queues
│   ├── response/                         # ApiResponse, PaginatedResponse, ResponseFactory
│   ├── supabase/                         # Supabase client, StoragePort, StorageAdapter
│   ├── testing/                          # Test app factory & helpers
│   └── shared.module.ts                  # Aggregates all shared modules
│
├── modules/
│   ├── user/                             # Example module 1 — CRUD + Auth + Events
│   │   ├── domain/                        # User entity, Email/UserId VOs, events, repo interface
│   │   ├── application/                   # Commands, Queries, Handlers, DTOs, Event handlers
│   │   ├── infrastructure/                # Prisma repo, Supabase auth adapter, mapper, processor
│   │   ├── presentation/                  # UserController (Swagger + guards + audit)
│   │   └── user.module.ts
│   │
│   └── post/                             # Example module 2 — CRUD + Upload + Publish + Pagination
│       ├── domain/                        # Post entity, Slug VO, events, repo interface
│       ├── application/                   # Commands, Queries, Handlers, DTOs, Event handlers
│       ├── infrastructure/               # Prisma repo, Storage adapter, mapper, processor
│       ├── presentation/                  # PostController (file upload + publish)
│       └── post.module.ts
│
├── app.module.ts                         # Root module with global providers
└── main.ts                               # Bootstrap: Helmet, CORS, Swagger, ValidationPipe
```

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | NestJS 11 + TypeScript                          |
| ORM        | Prisma (Supabase PostgreSQL)                    |
| Auth       | Supabase Auth (JWT)                             |
| Storage    | Supabase Storage (via port/adapter)             |
| Validation | class-validator + class-transformer + Zod (env) |
| API Docs   | @nestjs/swagger (auto-schema from DTOs)         |
| CQRS       | @nestjs/cqrs                                    |
| Jobs       | BullMQ + Redis                                  |
| Caching    | ioredis + custom CacheService                   |
| Logging    | nestjs-pino (structured JSON)                   |
| Testing    | Jest + Supertest                                |
| Security   | helmet, @nestjs/throttler, CORS                 |

## Key Features

- **Error Handling** — `AppError` hierarchy (`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `DomainError`) with `ErrorCode` catalog and global `AllExceptionsFilter`
- **Standard Response Format** — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiErrorResponse` via `ResponseFactory`
- **CQRS** — Commands (write), Queries (read), Domain Events (side effects)
- **Audit Trail** — `@AuditLog()` decorator → BullMQ job → `audit_logs` table
- **Caching** — `CacheService` with `delByPattern()` for cache invalidation via domain events
- **File Upload** — Supabase Storage via `StoragePort` interface (swappable)
- **Auth** — Supabase JWT validation + RBAC via `@Roles()` decorator
- **Request Tracing** — UUID `requestId` per request, propagated to logs and responses
- **Pagination** — `PaginationQueryDto` with page, limit, sortBy, sortOrder
- **Soft Delete** — `deletedAt` column on entities

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or Supabase project)
- Redis (for caching and job queues)

### Setup

```bash
# Clone
git clone https://github.com/zabukeinc/be-nest-boilerplate.git
cd be-nest-boilerplate

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your Supabase and database credentials

# Generate Prisma client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev

# Start development server
npm run dev
```

### Available Scripts

| Script                   | Description                      |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start dev server with hot reload |
| `npm run build`          | Compile TypeScript               |
| `npm run start:prod`     | Production mode                  |
| `npm run test`           | Run unit tests                   |
| `npm run test:watch`     | Tests in watch mode              |
| `npm run test:cov`       | Coverage report                  |
| `npm run test:e2e`       | End-to-end tests                 |
| `npm run lint`           | ESLint                           |
| `npm run format`         | Prettier                         |
| `npx prisma migrate dev` | Run migrations                   |
| `npx prisma studio`      | Prisma admin UI                  |

### Swagger Documentation

After starting the server, visit `http://localhost:3000/api/docs`

## Creating a New Module

Use the existing `user` or `post` module as a template. Each module follows this structure:

```
modules/your-module/
├── domain/
│   ├── entities/           # Pure domain entities (no ORM dependency)
│   ├── value-objects/      # Validated primitives (Email, Slug, etc.)
│   ├── events/             # Domain events for side effects
│   └── repositories/       # Repository interface (Port)
├── application/
│   ├── commands/           # Command + Handler per use case (write)
│   ├── queries/            # Query + Handler per use case (read)
│   ├── events/             # Domain event handlers
│   └── dtos/               # DTOs with @ApiProperty + class-validator
├── infrastructure/
│   ├── repositories/       # Prisma repository implementation (Adapter)
│   ├── adapters/           # External service adapters
│   ├── mappers/            # Prisma model ↔ Domain entity mapping
│   └── processors/         # BullMQ job processors
├── presentation/
│   └── your-module.controller.ts
└── your-module.module.ts
```

### Quick Steps

1. **Domain** — Define entity, value objects, and repository interface
2. **Application** — Create commands/queries and their handlers, DTOs with Swagger decorators
3. **Infrastructure** — Implement repository using Prisma, create mapper, add processors
4. **Presentation** — Create controller with guards, audit log decorator, Swagger tags
5. **Module** — Register all providers and wire CQRS module

## Path Aliases

```typescript
import { something } from '@shared/errors'; // src/@shared/errors
import { UserModule } from '@modules/user'; // src/modules/user
import { ConfigService } from '@config'; // src/@shared/config
```

Configured in `tsconfig.json`, `nest-cli.json`, and `jest.config.ts`.

## Response Format

All API responses are wrapped automatically by `TransformInterceptor`:

**Success:**

```json
{
  "success": true,
  "message": "Success",
  "data": { "id": "abc", "email": "john@example.com" },
  "meta": { "timestamp": "2026-04-27T...", "requestId": "uuid" }
}
```

**Paginated:**

```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "totalItems": 50, "totalPages": 5, "hasNext": true, "hasPrev": false },
  "meta": { "timestamp": "...", "requestId": "uuid" }
}
```

**Error:**

```json
{
  "success": false,
  "message": "User not found",
  "error": { "code": "USER_NOT_FOUND" },
  "meta": { "timestamp": "...", "requestId": "uuid" }
}
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable                    | Description                  |
| --------------------------- | ---------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string |
| `SUPABASE_URL`              | Supabase project URL         |
| `SUPABASE_KEY`              | Supabase anon key            |
| `SUPABASE_SERVICE_KEY`      | Supabase service role key    |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection             |
| `JWT_SECRET`                | Token verification secret    |
| `CORS_ORIGIN`               | Allowed CORS origins         |

All env vars are validated at startup via Zod — missing or invalid values will fail fast.

## Testing

### Unit Tests

```bash
npm run test           # All tests
npm run test:watch     # Watch mode
npm run test:cov       # With coverage
```

Tests are co-located with source files (`user.entity.spec.ts` next to `user.entity.ts`). Domain tests have zero NestJS dependencies.

### E2E Tests

```bash
npm run test:e2e
```

### Test Utilities

`@shared/testing/test-app.factory.ts` provides a `TestAppFactory` for creating NestJS test applications with overridden config.

## License

MIT
