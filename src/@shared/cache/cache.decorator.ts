import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache:metadata';

export interface CacheableOptions {
  ttl?: number;
  keyPrefix?: string;
}

export const Cacheable = (options: CacheableOptions = {}) =>
  SetMetadata(CACHE_KEY, {
    ttl: options.ttl || 300,
    keyPrefix: options.keyPrefix || '',
  });
