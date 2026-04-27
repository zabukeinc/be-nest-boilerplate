import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT, details?: any) {
    super(code, message, 409, details);
  }
}
