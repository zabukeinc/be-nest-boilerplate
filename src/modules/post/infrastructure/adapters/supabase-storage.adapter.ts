import { Injectable, Inject } from '@nestjs/common';
import { STORAGE_PORT, StoragePort } from '@shared/supabase';

@Injectable()
export class PostStorageService {
  constructor(@Inject(STORAGE_PORT) private readonly storagePort: StoragePort) {}

  async uploadImage(file: Buffer, filename: string, contentType: string): Promise<string> {
    const path = `posts/${Date.now()}-${filename}`;
    return this.storagePort.upload('post-images', path, file, contentType);
  }

  async deleteImage(path: string): Promise<void> {
    return this.storagePort.delete('post-images', path);
  }
}
