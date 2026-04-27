import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePostCommand } from './create-post.command';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { Post } from '../../../domain/entities/post.entity';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand, string> {
  constructor(@Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const post = Post.create(command.title, command.authorId, command.content);
    if (command.imageUrl) {
      post.setImageUrl(command.imageUrl);
    }
    const savedPost = await this.postRepository.create(post);
    return savedPost.getId();
  }
}
