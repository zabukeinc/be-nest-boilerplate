import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger();

  info(message: string, context?: Record<string, any>): void {
    this.logger.log({ msg: message, ...context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn({ msg: message, ...context });
  }

  error(message: string, context?: Record<string, any>, trace?: string): void {
    this.logger.error({ msg: message, ...context }, trace);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug({ msg: message, ...context });
  }
}
