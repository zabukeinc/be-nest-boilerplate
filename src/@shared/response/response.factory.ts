import {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  ResponseMeta,
  PaginationMeta,
} from './response.interface';

export class ResponseFactory {
  static success<T>(data: T, message: string = 'Success', requestId?: string): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  static paginated<T>(
    data: T[],
    pagination: { page: number; limit: number; totalItems: number },
    message: string = 'Success',
    requestId?: string,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(pagination.totalItems / pagination.limit);
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  static error(code: string, message: string, details?: any, requestId?: string): ApiErrorResponse {
    const response: ApiErrorResponse = {
      success: false,
      message,
      error: {
        code,
        ...(details && { details }),
      },
    };
    if (requestId) {
      response.meta = ResponseFactory.createMeta(requestId);
    }
    return response;
  }

  private static createMeta(requestId: string): ResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}
