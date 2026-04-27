import { PaginationQueryDto } from '@shared/pagination';

export class ListProductsQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
