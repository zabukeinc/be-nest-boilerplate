import { PaginationQueryDto } from '@shared/pagination';

export class ListPostsQuery {
  constructor(
    public readonly pagination: PaginationQueryDto,
    public readonly authorId?: string,
    public readonly published?: boolean,
  ) {}
}
