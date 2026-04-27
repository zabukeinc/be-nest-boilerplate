import { Post } from '../../domain/entities/post.entity';
import { Post as PrismaPost } from '@prisma/client';
import { PostResponseDto } from '../../application/dtos/post-response.dto';

export class PostMapper {
  static toDomain(prismaPost: PrismaPost): Post {
    return Post.reconstitute(
      prismaPost.id,
      prismaPost.title,
      prismaPost.slug,
      prismaPost.content,
      prismaPost.imageUrl,
      prismaPost.published,
      prismaPost.authorId,
      prismaPost.createdAt,
      prismaPost.updatedAt,
      prismaPost.publishedAt,
      prismaPost.deletedAt,
    );
  }

  static toResponseDto(post: Post): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.getId();
    dto.title = post.getTitle();
    dto.slug = post.getSlug();
    dto.content = post.getContent();
    dto.imageUrl = post.getImageUrl();
    dto.published = post.isPublished();
    dto.authorId = post.getAuthorId();
    dto.createdAt = post.getCreatedAt();
    dto.updatedAt = post.getUpdatedAt();
    dto.publishedAt = post.getPublishedAt();
    return dto;
  }
}
