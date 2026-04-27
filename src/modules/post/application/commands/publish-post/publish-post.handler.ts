import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PublishPostCommand } from './publish-post.command';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { NotFoundError, DomainError, ErrorCode } from '@shared/errors';
import { PostPublishedEvent } from '../../../domain/events/post-published.event';
import { CacheService } from '@shared/cache';

@CommandHandler(PublishPostCommand)
export class PublishPostHandler implements ICommandHandler<PublishPostCommand, void> {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository,
    private readonly eventBus: EventBus,
    private readonly cacheService: CacheService,
  ) {}

  async execute(command: PublishPostCommand): Promise<void> {
    const post = await this.postRepository.findById(command.id);
    if (!post) {
      throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
    }

    if (post.isPublished()) {
      throw new DomainError('Post is already published', ErrorCode.POST_ALREADY_PUBLISHED);
    }

    post.publish();
    await this.postRepository.update(post);

    await this.cacheService.delByPattern('posts:*');
    await this.cacheService.del(`post:${post.getSlug()}`);

    this.eventBus.publish(new PostPublishedEvent(post.getId(), post.getAuthorId()));
  }
}
