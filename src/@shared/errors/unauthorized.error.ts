import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    details?: any,
  ) {
    super(code, message, 401, details);
  }
}
