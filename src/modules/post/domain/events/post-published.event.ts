import { IEvent } from '@nestjs/cqrs';

export class PostPublishedEvent implements IEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
  ) {}
}
