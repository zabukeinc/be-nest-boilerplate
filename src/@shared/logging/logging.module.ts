import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') !== 'production';
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL') || 'info',
            transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
            redact: ['req.headers.authorization', 'req.body.password'],
            serializers: {
              req(req: any) {
                return {
                  method: req.method,
                  url: req.url,
                  id: req.id,
                };
              },
            },
          },
        };
      },
    }),
  ],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
