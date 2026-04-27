export abstract class BaseCreateHandler<Entity> {
  protected abstract validate(data: any): Promise<void>;
  protected abstract createEntity(data: any): Promise<Entity>;
  protected abstract saveEntity(entity: Entity): Promise<Entity>;
  protected abstract getEntityId(entity: Entity): string;
  protected async afterCreate(entity: Entity): Promise<void> {}

  async execute(command: any): Promise<string> {
    await this.validate(command.data ?? command);
    const entity = await this.createEntity(command.data ?? command);
    const saved = await this.saveEntity(entity);
    await this.afterCreate(saved);
    return this.getEntityId(saved);
  }
}

export abstract class BaseUpdateHandler<Entity> {
  protected abstract findEntity(id: string): Promise<Entity | null>;
  protected abstract updateEntity(entity: Entity, data: any): Promise<Entity>;
  protected abstract saveEntity(entity: Entity): Promise<Entity>;
  protected abstract getEntityId(entity: Entity): string;
  protected async validateUpdate(entity: Entity, data: any): Promise<void> {}
  protected async afterUpdate(entity: Entity): Promise<void> {}

  async execute(command: any): Promise<string> {
    const id = command.id ?? command.data?.id;
    const data = command.data ?? {};
    const entity = await this.findEntity(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    await this.validateUpdate(entity, data);
    const updated = await this.updateEntity(entity, data);
    const saved = await this.saveEntity(updated);
    await this.afterUpdate(saved);
    return this.getEntityId(saved);
  }
}

export abstract class BaseDeleteHandler {
  protected abstract findEntity(id: string): Promise<any | null>;
  protected abstract deleteEntity(id: string): Promise<void>;
  protected async beforeDelete(id: string): Promise<void> {}
  protected async afterDelete(id: string): Promise<void> {}

  async execute(command: any): Promise<void> {
    const id = command.id ?? command;
    const entity = await this.findEntity(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    await this.beforeDelete(id);
    await this.deleteEntity(id);
    await this.afterDelete(id);
  }
}

export abstract class BaseGetByIdHandler<Entity, ResponseDto> {
  protected abstract findEntity(id: string): Promise<Entity | null>;
  protected abstract toResponseDto(entity: Entity): ResponseDto;

  async execute(query: any): Promise<ResponseDto> {
    const id = query.id ?? query;
    const entity = await this.findEntity(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return this.toResponseDto(entity);
  }
}

export abstract class BaseListHandler<Entity, ResponseDto> {
  protected abstract findEntities(pagination: any): Promise<{ items: Entity[]; pagination: any }>;
  protected abstract toResponseDto(entity: Entity): ResponseDto;
  protected toPaginationMeta(pagination: any): any {
    const totalPages = Math.ceil(pagination.totalItems / pagination.limit);
    return {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: pagination.totalItems,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    };
  }

  async execute(query: any): Promise<any> {
    const result = await this.findEntities(query.pagination);
    const items = result.items.map((entity: Entity) => this.toResponseDto(entity));
    return {
      items,
      pagination: this.toPaginationMeta(result.pagination),
    };
  }
}
