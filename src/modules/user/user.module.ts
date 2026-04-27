import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { UserCreatedHandler } from './application/events/user-created.handler';
import { SendWelcomeEmailProcessor } from './infrastructure/processors/send-welcome-email.processor';
import { SupabaseAuthAdapter } from './infrastructure/adapters/supabase-auth.adapter';

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserHandler,
    ListUsersHandler,
    UserCreatedHandler,
    SupabaseAuthAdapter,
    SendWelcomeEmailProcessor,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
