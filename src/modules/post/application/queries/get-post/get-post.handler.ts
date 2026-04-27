import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPostQuery } from './get-post.query';
import {
  POST_REPOSITORY,
  IPostRepository,
} from '../../../domain/repositories/post.repository.interface';
import { NotFoundError, ErrorCode } from '@shared/errors';
import { PostResponseDto } from '../../dtos/post-response.dto';
import { PostMapper } from '../../../infrastructure/mappers/post.mapper';

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery, PostResponseDto> {
  constructor(@Inject(POST_REPOSITORY) private readonly postRepository: IPostRepository) {}

  async execute(query: GetPostQuery): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(query.id);
    if (!post) {
      throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
    }
    return PostMapper.toResponseDto(post);
  }
}
