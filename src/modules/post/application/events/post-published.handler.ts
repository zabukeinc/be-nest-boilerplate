import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PostPublishedEvent } from '../../domain/events/post-published.event';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@shared/queue';

@EventsHandler(PostPublishedEvent)
export class PostPublishedHandler implements IEventHandler<PostPublishedEvent> {
  private readonly logger = new Logger(PostPublishedHandler.name);

  constructor(@InjectQueue(QUEUE_NAMES.NOTIFICATION) private readonly notificationQueue: Queue) {}

  async handle(event: PostPublishedEvent) {
    this.logger.log(`Post published: ${event.postId} by author ${event.authorId}`);
    await this.notificationQueue.add('post-published-notification', {
      postId: event.postId,
      authorId: event.authorId,
    });
  }
}
