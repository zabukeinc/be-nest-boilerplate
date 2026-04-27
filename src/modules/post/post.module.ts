import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostController } from './presentation/post.controller';
import { POST_REPOSITORY } from './domain/repositories/post.repository.interface';
import { PostRepositoryImpl } from './infrastructure/repositories/post.repository.impl';
import { CreatePostHandler } from './application/commands/create-post/create-post.handler';
import { PublishPostHandler } from './application/commands/publish-post/publish-post.handler';
import { GetPostHandler } from './application/queries/get-post/get-post.handler';
import { ListPostsHandler } from './application/queries/list-posts/list-posts.handler';
import { PostPublishedHandler } from './application/events/post-published.handler';
import { PostStorageService } from './infrastructure/adapters/supabase-storage.adapter';
import { ProcessImageProcessor } from './infrastructure/processors/process-image.processor';

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [
    { provide: POST_REPOSITORY, useClass: PostRepositoryImpl },
    CreatePostHandler,
    PublishPostHandler,
    GetPostHandler,
    ListPostsHandler,
    PostPublishedHandler,
    PostStorageService,
    ProcessImageProcessor,
  ],
  exports: [POST_REPOSITORY],
})
export class PostModule {}
