import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: ErrorCode = ErrorCode.FORBIDDEN, details?: any) {
    super(code, message, 403, details);
  }
}
