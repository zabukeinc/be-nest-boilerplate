import { AppError } from './app.error';
import { ErrorCode } from './error-code.enum';

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_FAILED, message, 400, details);
  }
}
