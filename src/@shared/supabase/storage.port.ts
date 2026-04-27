export interface StoragePort {
  upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
