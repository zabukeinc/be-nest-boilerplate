export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  meta?: ResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: any;
  };
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
