#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: node scripts/generate-module.js <ModuleName>');
  console.error('Example: node scripts/generate-module.js Product');
  process.exit(1);
}

const lower = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
const upper = moduleName.toUpperCase();
const snake = moduleName
  .replace(/([A-Z])/g, '_$1')
  .replace(/^_/, '')
  .toUpperCase();
const moduleDir = path.resolve(__dirname, '..', 'src', 'modules', lower);

if (fs.existsSync(moduleDir)) {
  console.error(`Module "${lower}" already exists at ${moduleDir}`);
  process.exit(1);
}

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content);
}

const dirs = [
  `${moduleDir}/domain/entities`,
  `${moduleDir}/domain/repositories`,
  `${moduleDir}/domain/value-objects`,
  `${moduleDir}/domain/events`,
  `${moduleDir}/application/commands/create-${lower}`,
  `${moduleDir}/application/commands/update-${lower}`,
  `${moduleDir}/application/commands/delete-${lower}`,
  `${moduleDir}/application/queries/get-${lower}`,
  `${moduleDir}/application/queries/list-${lower}s`,
  `${moduleDir}/application/events`,
  `${moduleDir}/application/dtos`,
  `${moduleDir}/infrastructure/repositories`,
  `${moduleDir}/infrastructure/mappers`,
  `${moduleDir}/infrastructure/adapters`,
  `${moduleDir}/infrastructure/processors`,
  `${moduleDir}/presentation`,
];

dirs.forEach(mkdir);

// --- Entity ---
write(
  `${moduleDir}/domain/entities/${lower}.entity.ts`,
  `import { BaseEntity } from '@shared/base';

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
`,
);

// --- Repository Interface ---
write(
  `${moduleDir}/domain/repositories/${lower}.repository.interface.ts`,
  `import { IBaseRepository } from '@shared/base';
import { ${moduleName} } from '../entities/${lower}.entity';

export const ${snake}_REPOSITORY = Symbol('${snake}_REPOSITORY');

export interface I${moduleName}Repository extends IBaseRepository<${moduleName}> {
}
`,
);

// --- Events ---
write(
  `${moduleDir}/domain/events/${lower}-created.event.ts`,
  `import { IEvent } from '@nestjs/cqrs';

export class ${moduleName}CreatedEvent implements IEvent {
  constructor(
    public readonly ${lower}Id: string,
  ) {}
}
`,
);

// --- DTOs ---
write(
  `${moduleDir}/application/dtos/create-${lower}.dto.ts`,
  `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class Create${moduleName}Dto {
  @ApiProperty()
  @IsString()
  name: string;
}
`,
);

write(
  `${moduleDir}/application/dtos/update-${lower}.dto.ts`,
  `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class Update${moduleName}Dto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
`,
);

write(
  `${moduleDir}/application/dtos/${lower}-response.dto.ts`,
  `import { ApiProperty } from '@nestjs/swagger';

export class ${moduleName}ResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
`,
);

// --- Commands ---
write(
  `${moduleDir}/application/commands/create-${lower}/create-${lower}.command.ts`,
  `export class Create${moduleName}Command {
  constructor(
    public readonly name: string,
  ) {}
}
`,
);

write(
  `${moduleDir}/application/commands/create-${lower}/create-${lower}.handler.ts`,
  `import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BaseCreateHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${lower}.entity';
import { ${snake}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${lower}.repository.interface';
import { ${moduleName}CreatedEvent } from '../../../domain/events/${lower}-created.event';

export class Create${moduleName}Handler extends BaseCreateHandler<${moduleName}> {
  constructor(
    @Inject(${snake}_REPOSITORY) private readonly repository: I${moduleName}Repository,
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
`,
);

write(
  `${moduleDir}/application/commands/update-${lower}/update-${lower}.command.ts`,
  `export class Update${moduleName}Command {
  constructor(
    public readonly id: string,
    public readonly name?: string,
  ) {}
}
`,
);

write(
  `${moduleDir}/application/commands/update-${lower}/update-${lower}.handler.ts`,
  `import { Inject } from '@nestjs/common';
import { BaseUpdateHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${lower}.entity';
import { ${snake}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${lower}.repository.interface';

export class Update${moduleName}Handler extends BaseUpdateHandler<${moduleName}> {
  constructor(
    @Inject(${snake}_REPOSITORY) private readonly repository: I${moduleName}Repository,
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
`,
);

write(
  `${moduleDir}/application/commands/delete-${lower}/delete-${lower}.command.ts`,
  `export class Delete${moduleName}Command {
  constructor(public readonly id: string) {}
}
`,
);

write(
  `${moduleDir}/application/commands/delete-${lower}/delete-${lower}.handler.ts`,
  `import { Inject } from '@nestjs/common';
import { BaseDeleteHandler } from '@shared/base';
import { ${snake}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${lower}.repository.interface';

export class Delete${moduleName}Handler extends BaseDeleteHandler {
  constructor(
    @Inject(${snake}_REPOSITORY) private readonly repository: I${moduleName}Repository,
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
`,
);

// --- Queries ---
write(
  `${moduleDir}/application/queries/get-${lower}/get-${lower}.query.ts`,
  `export class Get${moduleName}Query {
  constructor(public readonly id: string) {}
}
`,
);

write(
  `${moduleDir}/application/queries/get-${lower}/get-${lower}.handler.ts`,
  `import { Inject } from '@nestjs/common';
import { BaseGetByIdHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${lower}.entity';
import { ${snake}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${lower}.repository.interface';
import { ${moduleName}ResponseDto } from '../../dtos/${lower}-response.dto';
import { ${moduleName}Mapper } from '../../../infrastructure/mappers/${lower}.mapper';

export class Get${moduleName}Handler extends BaseGetByIdHandler<${moduleName}, ${moduleName}ResponseDto> {
  constructor(
    @Inject(${snake}_REPOSITORY) private readonly repository: I${moduleName}Repository,
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
`,
);

write(
  `${moduleDir}/application/queries/list-${lower}s/list-${lower}s.query.ts`,
  `import { PaginationQueryDto } from '@shared/pagination';

export class List${moduleName}sQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
`,
);

write(
  `${moduleDir}/application/queries/list-${lower}s/list-${lower}s.handler.ts`,
  `import { Inject } from '@nestjs/common';
import { BaseListHandler } from '@shared/base';
import { ${moduleName} } from '../../../domain/entities/${lower}.entity';
import { ${snake}_REPOSITORY, I${moduleName}Repository } from '../../../domain/repositories/${lower}.repository.interface';
import { ${moduleName}ResponseDto } from '../../dtos/${lower}-response.dto';
import { ${moduleName}Mapper } from '../../../infrastructure/mappers/${lower}.mapper';

export class List${moduleName}sHandler extends BaseListHandler<${moduleName}, ${moduleName}ResponseDto> {
  constructor(
    @Inject(${snake}_REPOSITORY) private readonly repository: I${moduleName}Repository,
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
`,
);

// --- Infrastructure ---
write(
  `${moduleDir}/infrastructure/mappers/${lower}.mapper.ts`,
  `import { ${moduleName} } from '../../domain/entities/${lower}.entity';
import { ${moduleName}ResponseDto } from '../../application/dtos/${lower}-response.dto';

export class ${moduleName}Mapper {
  static toDomain(prisma: any): ${moduleName} {
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
`,
);

write(
  `${moduleDir}/infrastructure/repositories/${lower}.repository.impl.ts`,
  `import { Injectable } from '@nestjs/common';
import { BaseRepositoryImpl } from '@shared/base';
import { PrismaService } from '@shared/database';
import { ${moduleName} } from '../../domain/entities/${lower}.entity';
import { ${moduleName}Mapper } from '../mappers/${lower}.mapper';

@Injectable()
export class ${moduleName}RepositoryImpl extends BaseRepositoryImpl<${moduleName}, any> {
  constructor(prisma: PrismaService) {
    super(prisma, '${lower}');
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
`,
);

// --- Presentation ---
write(
  `${moduleDir}/presentation/${lower}.controller.ts`,
  `import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { createBaseController } from '@shared/base';
import { Create${moduleName}Dto } from '../application/dtos/create-${lower}.dto';
import { Update${moduleName}Dto } from '../application/dtos/update-${lower}.dto';
import { ${moduleName}ResponseDto } from '../application/dtos/${lower}-response.dto';
import { Create${moduleName}Command } from '../application/commands/create-${lower}/create-${lower}.command';
import { Update${moduleName}Command } from '../application/commands/update-${lower}/update-${lower}.command';
import { Delete${moduleName}Command } from '../application/commands/delete-${lower}/delete-${lower}.command';
import { Get${moduleName}Query } from '../application/queries/get-${lower}/get-${lower}.query';
import { List${moduleName}sQuery } from '../application/queries/list-${lower}s/list-${lower}s.query';

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
`,
);

// --- Module ---
write(
  `${moduleDir}/${lower}.module.ts`,
  `import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ${moduleName}Controller } from './presentation/${lower}.controller';
import { ${snake}_REPOSITORY } from './domain/repositories/${lower}.repository.interface';
import { ${moduleName}RepositoryImpl } from './infrastructure/repositories/${lower}.repository.impl';
import { Create${moduleName}Handler } from './application/commands/create-${lower}/create-${lower}.handler';
import { Update${moduleName}Handler } from './application/commands/update-${lower}/update-${lower}.handler';
import { Delete${moduleName}Handler } from './application/commands/delete-${lower}/delete-${lower}.handler';
import { Get${moduleName}Handler } from './application/queries/get-${lower}/get-${lower}.handler';
import { List${moduleName}sHandler } from './application/queries/list-${lower}s/list-${lower}s.handler';

@Module({
  imports: [CqrsModule],
  controllers: [${moduleName}Controller],
  providers: [
    { provide: ${snake}_REPOSITORY, useClass: ${moduleName}RepositoryImpl },
    Create${moduleName}Handler,
    Update${moduleName}Handler,
    Delete${moduleName}Handler,
    Get${moduleName}Handler,
    List${moduleName}sHandler,
  ],
  exports: [${snake}_REPOSITORY],
})
export class ${moduleName}Module {}
`,
);

// --- Done ---
console.log(`\n✅ Module "${moduleName}" created at src/modules/${lower}/`);
console.log('\nNext steps:');
console.log(`  1. Add ${moduleName} model to prisma/schema.prisma`);
console.log(`  2. Run: npx prisma migrate dev --name add-${lower}`);
console.log(`  3. Import ${moduleName}Module in app.module.ts`);
console.log('  4. Customize entity fields, DTOs, and handlers as needed\n');
