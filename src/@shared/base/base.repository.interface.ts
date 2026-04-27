import { PaginatedResult } from '../pagination';

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResult<T>>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
