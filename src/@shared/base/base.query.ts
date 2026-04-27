import { PaginationQueryDto } from '../pagination';

export class GetByIdQuery {
  constructor(public readonly id: string) {}
}

export class ListQuery {
  constructor(public readonly pagination: PaginationQueryDto) {}
}
