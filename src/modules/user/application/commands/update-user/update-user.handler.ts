import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, string> {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<string> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    if (command.name !== undefined) {
      user.updateName(command.name);
    }
    if (command.avatarUrl !== undefined) {
      user.updateAvatarUrl(command.avatarUrl);
    }

    await this.userRepository.update(user);
    return user.getId();
  }
}
