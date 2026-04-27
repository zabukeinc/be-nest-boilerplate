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
