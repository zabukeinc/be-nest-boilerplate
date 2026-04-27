import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseStorageAdapter } from './supabase-storage.adapter';
import { STORAGE_PORT } from './storage.port';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: STORAGE_PORT,
      useClass: SupabaseStorageAdapter,
    },
  ],
  exports: [SupabaseService, STORAGE_PORT],
})
export class SupabaseModule {}
