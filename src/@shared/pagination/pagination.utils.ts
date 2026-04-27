export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function getPaginationParams(query: PaginationParams) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const orderBy: Record<string, 'asc' | 'desc'> = query.sortBy
    ? { [query.sortBy]: query.sortOrder || 'desc' }
    : { createdAt: 'desc' };

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy,
  };
}
