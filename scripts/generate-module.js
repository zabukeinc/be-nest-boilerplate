#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: node scripts/generate-module.js <ModuleName>');
  console.error('Example: node scripts/generate-module.js Product');
  process.exit(1);
}

const moduleNameLower = moduleName.toLowerCase();
const moduleNameKebab = moduleNameLower.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
const moduleDir = path.resolve(__dirname, '..', 'src', 'modules', moduleNameLower);

if (fs.existsSync(moduleDir)) {
  console.error(`Module "${moduleNameLower}" already exists at ${moduleDir}`);
  process.exit(1);
}

function pascalToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function pascalToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

const snakeName = pascalToSnake(moduleName);
const kebabName = pascalToKebab(moduleName);

const dirs = [
  `${moduleDir}/domain/entities`,
  `${moduleDir}/domain/repositories`,
  `${moduleDir}/domain/value-objects`,
  `${moduleDir}/domain/events`,
  `${moduleDir}/application/commands/create-${moduleNameLower}`,
  `${moduleDir}/application/commands/update-${moduleNameLower}`,
  `${moduleDir}/application/commands/delete-${moduleNameLower}`,
  `${moduleDir}/application/queries/get-${moduleNameLower}`,
  `${moduleDir}/application/queries/list-${moduleNameLower}s`,
  `${moduleDir}/application/events`,
  `${moduleDir}/application/dtos`,
  `${moduleDir}/infrastructure/repositories`,
  `${moduleDir}/infrastructure/mappers`,
  `${moduleDir}/infrastructure/adapters`,
  `${moduleDir}/infrastructure/processors`,
  `${moduleDir}/presentation`,
];

dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));

const files = {};

files[`${moduleDir}/domain/entities/${moduleNameLower}.entity.ts`] = `import { BaseEntity } from '@shared/base';

export class ${moduleName} extends BaseEntity {
  private constructor(
    private readonly entityId: string,
    private name: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {
    super();
  }

  static create(name: string): ${moduleName} {
    const now = new Date();
    return new ${moduleName}('', name, now, now, null);
  }

  static reconstitute(
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): ${moduleName} {
    return new ${moduleName}(id, name, createdAt, updatedAt, deletedAt);
  }

  getId(): string { return this.entityId; }
  getName(): string { return this.name; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
  getDeletedAt(): Date | null { return this.deletedAt; }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  markDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
`;

files[`${moduleDir}/domain/repositories/${moduleNameLower}.repository.interface.ts`] = `import { IBaseRepository } from '@shared/base';
import { ${moduleName} } from '../entities/${moduleNameLower}.entity';

export const ${moduleNameUpper()}_REPOSITORY = Symbol('${moduleNameUpper()}_REPOSITORY');

export interface I${moduleName}Repository extends IBaseRepository<${moduleName}> {
}
`;

files[`${moduleDir}/domain/events/${moduleNameLower}-created.event.ts`] = `import { IEvent } from '@nestjs/cqrs';

export class ${moduleName}CreatedEvent implements IEvent {
  constructor(
    public readonly ${moduleNameLower}Id: string,
  ) {}
}
`;

files[`${moduleDir}/application/dtos/create-${moduleNameLower}.dto.ts`] = `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class Create${moduleName}Dto {
  @ApiProperty()
  @IsString()
  name: string;
}
`;

files[`${moduleDir}/application/dtos/update-${moduleNameLower}.dto.ts`] = `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class Update${moduleName}Dto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
`;

files[`${moduleDir}/application/dtos/${moduleNameLower}-response.dto.ts`] = `import { ApiProperty } from '@nestjs/swagger';

export class ${moduleName}ResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
`;

files[`${moduleDir}/application/commands/create-${moduleNameLower}/create-${moduleNameLower}.command.ts`] = `export class Create${moduleName}Command {
  constructor(
    public readonly name: string,
  ) {}
}
`;

files[`${moduleDir}/application/commands/create-${moduleNameLower}/create-${moduleNameLower}.handler.ts`] = `import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BaseCreateHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${moduleNameLower}.entity';
import { ${moduleNameUpper()}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${moduleNameLower}.repository.interface';
import { ${moduleName}CreatedEvent } from '../../../domain/events/${moduleNameLower}-created.event';

export class Create${moduleName}Handler extends BaseCreateHandler<${moduleName}> {
  constructor(
    @Inject(${moduleNameUpper()}_REPOSITORY) private readonly repository: I${moduleName}Repository,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  protected async validate(data: any): Promise<void> {}
  protected async createEntity(data: any): Promise<${moduleName}> {
    return ${moduleName}.create(data.name);
  }
  protected async saveEntity(entity: ${moduleName}): Promise<${moduleName}> {
    return this.repository.create(entity);
  }
  protected getEntityId(entity: ${moduleName}): string {
    return entity.getId();
  }
  protected async afterCreate(entity: ${moduleName}): Promise<void> {
    this.eventBus.publish(new ${moduleName}CreatedEvent(entity.getId()));
  }
}
`;

files[`${moduleDir}/application/commands/update-${moduleNameLower}/update-${moduleNameLower}.command.ts`] = `export class Update${moduleName}Command {
  constructor(
    public readonly id: string,
    public readonly name?: string,
  ) {}
}
`;

files[`${moduleDir}/application/commands/update-${moduleNameLower}/update-${moduleNameLower}.handler.ts`] = `import { Inject } from '@nestjs/common';
import { BaseUpdateHandler } from '@shared/base';
import { NotFoundError, ErrorCode } from '@shared/errors';
import { ${moduleName} } from '../../../domain/entities/${moduleNameLower}.entity';
import { ${moduleNameUpper()}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${moduleNameLower}.repository.interface';

export class Update${moduleName}Handler extends BaseUpdateHandler<${moduleName}> {
  constructor(
    @Inject(${moduleNameUpper()}_REPOSITORY) private readonly repository: I${moduleName}Repository,
  ) {
    super();
  }

  protected async findEntity(id: string): Promise<${moduleName} | null> {
    return this.repository.findById(id);
  }
  protected async updateEntity(entity: ${moduleName}, data: any): Promise<${moduleName}> {
    if (data.name !== undefined) {
      entity.updateName(data.name);
    }
    return entity;
  }
  protected async saveEntity(entity: ${moduleName}): Promise<${moduleName}> {
    return this.repository.update(entity);
  }
  protected getEntityId(entity: ${moduleName}): string {
    return entity.getId();
  }
}
`;

files[`${moduleDir}/application/commands/delete-${moduleNameLower}/delete-${moduleNameLower}.command.ts`] = `export class Delete${moduleName}Command {
  constructor(public readonly id: string) {}
}
`;

files[`${moduleDir}/application/commands/delete-${moduleNameLower}/delete-${moduleNameLower}.handler.ts`] = `import { Inject } from '@nestjs/common';
import { BaseDeleteHandler } from '@shared/base';
import { ${moduleNameUpper()}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${moduleNameLower}.repository.interface';

export class Delete${moduleName}Handler extends BaseDeleteHandler {
  constructor(
    @Inject(${moduleNameUpper()}_REPOSITORY) private readonly repository: I${moduleName}Repository,
  ) {
    super();
  }

  protected async findEntity(id: string): Promise<any | null> {
    return this.repository.findById(id);
  }
  protected async deleteEntity(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
`;

files[`${moduleDir}/application/queries/get-${moduleNameLower}/get-${moduleNameLower}.query.ts`] = `export class Get${moduleName}Query {
  constructor(public readonly id: string) {}
}
`;

files[`${moduleDir}/application/queries/get-${moduleNameLower}/get-${moduleNameLower}.handler.ts`] = `import { Inject } from '@nestjs/common';
import { BaseGetByIdHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${moduleNameLower}.entity';
import { ${moduleNameUpper()}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${moduleNameLower}.repository.interface';
import { ${moduleName}ResponseDto } from '../../dtos/${moduleNameLower}-response.dto';
import { ${moduleName}Mapper } from '../../../infrastructure/mappers/${moduleNameLower}.mapper';

export class Get${moduleName}Handler extends BaseGetByIdHandler<${moduleName}, ${moduleName}ResponseDto> {
  constructor(
    @Inject(${moduleNameUpper()}_REPOSITORY) private readonly repository: I${moduleName}Repository,
  ) {
    super();
  }

  protected async findEntity(id: string): Promise<${moduleName} | null> {
    return this.repository.findById(id);
  }
  protected toResponseDto(entity: ${moduleName}): ${moduleName}ResponseDto {
    return ${moduleName}Mapper.toResponseDto(entity);
  }
}
`;

files[`${moduleDir}/application/queries/list-${moduleNameLower}s/list-${moduleNameLower}s.query.ts`] = `import { PaginationQueryDto } from '@shared/pagination';

export class List${moduleName}sQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
`;

files[`${moduleDir}/application/queries/list-${moduleNameLower}s/list-${moduleNameLower}s.handler.ts`] = `import { Inject } from '@nestjs/common';
import { BaseListHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${moduleNameLower}.entity';
import { ${moduleNameUpper()}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${moduleNameLower}.repository.interface';
import { ${moduleName}ResponseDto } from '../../dtos/${moduleNameLower}-response.dto';
import { ${moduleName}Mapper } from '../../../infrastructure/mappers/${moduleNameLower}.mapper';

export class List${moduleName}sHandler extends BaseListHandler<${moduleName}, ${moduleName}ResponseDto> {
  constructor(
    @Inject(${moduleNameUpper()}_REPOSITORY) private readonly repository: I${moduleName}Repository,
  ) {
    super();
  }

  protected async findEntities(pagination: any): Promise<{ items: ${moduleName}[]; pagination: any }> {
    return this.repository.findAll(
      pagination.page || 1,
      pagination.limit || 10,
      pagination.sortBy,
      pagination.sortOrder,
    );
  }
  protected toResponseDto(entity: ${moduleName}): ${moduleName}ResponseDto {
    return ${moduleName}Mapper.toResponseDto(entity);
  }
}
`;

files[`${moduleDir}/infrastructure/mappers/${moduleNameLower}.mapper.ts`] = `import { ${moduleName} } from '../../domain/entities/${moduleNameLower}.entity';
import { ${moduleName} as Prisma${moduleName} } from '@prisma/client';
import { ${moduleName}ResponseDto } from '../../application/dtos/${moduleNameLower}-response.dto';

export class ${moduleName}Mapper {
  static toDomain(prisma: Prisma${moduleName} | any): ${moduleName} {
    return ${moduleName}.reconstitute(
      prisma.id,
      prisma.name,
      prisma.createdAt,
      prisma.updatedAt,
      prisma.deletedAt,
    );
  }

  static toResponseDto(entity: ${moduleName}): ${moduleName}ResponseDto {
    const dto = new ${moduleName}ResponseDto();
    dto.id = entity.getId();
    dto.name = entity.getName();
    dto.createdAt = entity.getCreatedAt();
    dto.updatedAt = entity.getUpdatedAt();
    return dto;
  }
}
`;

files[`${moduleDir}/infrastructure/repositories/${moduleNameLower}.repository.impl.ts`] = `import { Injectable } from '@nestjs/common';
import { BaseRepositoryImpl } from '@shared/base';
import { PrismaService } from '@shared/database';
import { ${moduleName} } from '../../domain/entities/${moduleNameLower}.entity';
import { ${moduleName}Mapper } from '../mappers/${moduleNameLower}.mapper';

@Injectable()
export class ${moduleName}RepositoryImpl extends BaseRepositoryImpl<${moduleName}, any> {
  constructor(prisma: PrismaService) {
    super(prisma, '${moduleNameLower}');
  }

  protected toDomain(model: any): ${moduleName} {
    return ${moduleName}Mapper.toDomain(model);
  }
  protected toCreateData(entity: ${moduleName}): any {
    return {
      id: entity.getId(),
      name: entity.getName(),
    };
  }
  protected toUpdateData(entity: ${moduleName}): any {
    return {
      name: entity.getName(),
    };
  }
  protected getId(entity: ${moduleName}): string {
    return entity.getId();
  }
}
`;

files[`${moduleDir}/presentation/${moduleNameLower}.controller.ts`] = `import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { createBaseController } from '@shared/base';
import { Create${moduleName}Dto } from '../application/dtos/create-${moduleNameLower}.dto';
import { Update${moduleName}Dto } from '../application/dtos/update-${moduleNameLower}.dto';
import { ${moduleName}ResponseDto } from '../application/dtos/${moduleNameLower}-response.dto';
import { Create${moduleName}Command } from '../application/commands/create-${moduleNameLower}/create-${moduleNameLower}.command';
import { Update${moduleName}Command } from '../application/commands/update-${moduleNameLower}/update-${moduleNameLower}.command';
import { Delete${moduleName}Command } from '../application/commands/delete-${moduleNameLower}/delete-${moduleNameLower}.command';
import { Get${moduleName}Query } from '../application/queries/get-${moduleNameLower}/get-${moduleNameLower}.query';
import { List${moduleName}sQuery } from '../application/queries/list-${moduleNameLower}s/list-${moduleNameLower}s.query';

const Base${moduleName}Controller = createBaseController({
  name: '${moduleName}s',
  createDto: Create${moduleName}Dto,
  updateDto: Update${moduleName}Dto,
  responseDto: ${moduleName}ResponseDto,
  createCommand: Create${moduleName}Command,
  updateCommand: Update${moduleName}Command,
  deleteCommand: Delete${moduleName}Command,
  getByIdQuery: Get${moduleName}Query,
  listQuery: List${moduleName}sQuery,
});

export class ${moduleName}Controller extends Base${moduleName}Controller {
  constructor(
    commandBus: CommandBus,
    queryBus: QueryBus,
  ) {
    super(commandBus, queryBus);
  }
}
`;

files[`${moduleDir}/${moduleNameLower}.module.ts`] = `import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ${moduleName}Controller } from './presentation/${moduleNameLower}.controller';
import { ${moduleNameUpper()}_REPOSITORY } from './domain/repositories/${moduleNameLower}.repository.interface';
import { ${moduleName}RepositoryImpl } from './infrastructure/repositories/${moduleNameLower}.repository.impl';
import { Create${moduleName}Handler } from './application/commands/create-${moduleNameLower}/create-${moduleNameLower}.handler';
import { Update${moduleName}Handler } from './application/commands/update-${moduleNameLower}/update-${moduleNameLower}.handler';
import { Delete${moduleName}Handler } from './application/commands/delete-${moduleNameLower}/delete-${moduleNameLower}.handler';
import { Get${moduleName}Handler } from './application/queries/get-${moduleNameLower}/get-${moduleNameLower}.handler';
import { List${moduleName}sHandler } from './application/queries/list-${moduleNameLower}s/list-${moduleNameLower}s.handler';

@Module({
  imports: [CqrsModule],
  controllers: [${moduleName}Controller],
  providers: [
    { provide: ${moduleNameUpper()}_REPOSITORY, useClass: ${moduleName}RepositoryImpl },
    Create${moduleName}Handler,
    Update${moduleName}Handler,
    Delete${moduleName}Handler,
    Get${moduleName}Handler,
    List${moduleName}sHandler,
  ],
  exports: [${moduleNameUpper()}_REPOSITORY],
})
export class ${moduleName}Module {}
`;

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(filePath, content);
}

console.log(`\n✅ Module "${moduleName}" created at src/modules/${moduleNameLower}/`);
console.log(`\nNext steps:`);
console.log(`  1. Add ${moduleName} model to prisma/schema.prisma`);
console.log(`  2. Run: npx prisma migrate dev --name add-${moduleNameLower}`);
console.log(`  3. Import ${moduleName}Module in app.module.ts`);
console.log(`  4. Customize entity fields, DTOs, and handlers as needed\n`);

function moduleNameUpper() {
  return moduleName.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
}
`;

writeAssertions = null;