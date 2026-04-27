import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NOT_FOUND, details?: any) {
    super(code, message, 404, details);
  }
}
