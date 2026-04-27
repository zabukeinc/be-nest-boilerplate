import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AppConfigService } from '@shared/config';

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useFactory: (configService: AppConfigService) => {
        return new CacheService(configService.redisHost, configService.redisPort);
      },
      inject: [AppConfigService],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
