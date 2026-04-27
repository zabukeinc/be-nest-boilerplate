import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { StoragePort } from './storage.port';

@Injectable()
export class SupabaseStorageAdapter implements StoragePort {
  constructor(private readonly supabaseService: SupabaseService) {}

  async upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = this.supabaseService.adminClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabaseService.adminClient.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
