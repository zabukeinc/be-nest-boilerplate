import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { LoggingModule } from './logging';
import { PrismaModule } from './database';
import { SupabaseModule } from './supabase';
import { CacheModule } from './cache';
import { QueueModule } from './queue';

@Global()
@Module({
  imports: [ConfigModule, LoggingModule, PrismaModule, SupabaseModule, CacheModule, QueueModule],
  exports: [ConfigModule, LoggingModule, PrismaModule, SupabaseModule, CacheModule, QueueModule],
})
export class SharedModule {}
