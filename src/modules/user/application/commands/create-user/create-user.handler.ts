import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { ConflictError, ErrorCode } from '@shared/errors';
import { User } from '../../../domain/entities/user.entity';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictError('User with this email already exists', ErrorCode.USER_EMAIL_EXISTS);
    }

    const user = User.create(command.email, command.name);
    const savedUser = await this.userRepository.create(user);

    this.eventBus.publish(
      new UserCreatedEvent(savedUser.getId(), savedUser.getEmail(), savedUser.getName()),
    );

    return savedUser.getId();
  }
}
