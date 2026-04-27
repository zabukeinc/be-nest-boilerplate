import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class DomainError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.DOMAIN_ERROR, details?: any) {
    super(code, message, 422, details);
  }
}
