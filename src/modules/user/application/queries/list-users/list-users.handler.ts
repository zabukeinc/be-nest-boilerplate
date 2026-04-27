import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './list-users.query';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
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
