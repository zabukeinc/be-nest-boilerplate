import { PaginationQueryDto } from '@shared/pagination';

export class ListUsersQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
