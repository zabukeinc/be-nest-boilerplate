import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfigService } from '@shared/config';

@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient;
  public readonly adminClient: SupabaseClient;

  constructor(private readonly configService: AppConfigService) {
    this.client = createClient(configService.supabaseUrl, configService.supabaseKey);
    this.adminClient = createClient(configService.supabaseUrl, configService.supabaseServiceKey);
  }
}
