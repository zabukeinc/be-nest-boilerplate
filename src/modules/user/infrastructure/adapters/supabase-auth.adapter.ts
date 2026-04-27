import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@shared/supabase';
import { DomainError, ErrorCode } from '@shared/errors';

@Injectable()
export class SupabaseAuthAdapter {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(email: string, password: string): Promise<string> {
    const { data, error } = await this.supabaseService.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new DomainError(
        `Failed to create auth user: ${error.message}`,
        ErrorCode.USER_EMAIL_EXISTS,
      );
    }

    return data.user.id;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabaseService.adminClient.auth.admin.deleteUser(userId);
    if (error) {
      throw new DomainError(
        `Failed to delete auth user: ${error.message}`,
        ErrorCode.USER_NOT_FOUND,
      );
    }
  }
}
