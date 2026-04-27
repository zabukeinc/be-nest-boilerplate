import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';
import { PaginatedResult } from '../pagination';
import { getPaginationParams } from '../pagination';
import { Prisma } from '@prisma/client';

export abstract class BaseRepositoryImpl<T, M> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  protected abstract toDomain(model: M): T;
  protected abstract toCreateData(entity: T): any;
  protected abstract toUpdateData(entity: T): any;
  protected abstract getId(entity: T): string;

  async findById(id: string): Promise<T | null> {
    const model = await (this.prisma as any)[this.modelName].findFirst({
      where: { id, deletedAt: null },
    });
    return model ? this.toDomain(model) : null;
  }

  async findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResult<T>> {
    const { skip, take, orderBy } = getPaginationParams({ page, limit, sortBy, sortOrder });
    const where = { deletedAt: null };

    const [models, totalItems] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({ where, skip, take, orderBy }),
      (this.prisma as any)[this.modelName].count({ where }),
    ]);

    return {
      items: models.map((m: M) => this.toDomain(m)),
      pagination: { page, limit, totalItems },
    };
  }

  async create(entity: T): Promise<T> {
    const model = await (this.prisma as any)[this.modelName].create({
      data: this.toCreateData(entity),
    });
    return this.toDomain(model);
  }

  async update(entity: T): Promise<T> {
    const model = await (this.prisma as any)[this.modelName].update({
      where: { id: this.getId(entity) },
      data: this.toUpdateData(entity),
    });
    return this.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any)[this.modelName].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
