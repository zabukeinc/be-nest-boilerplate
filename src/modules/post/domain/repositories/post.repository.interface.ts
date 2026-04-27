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
