import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostMapper } from '../mappers/post.mapper';
import { PaginatedResult } from '@shared/pagination';
import { getPaginationParams } from '@shared/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostRepositoryImpl implements IPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Post | null> {
    const prismaPost = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });
    if (!prismaPost) return null;
    return PostMapper.toDomain(prismaPost);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const prismaPost = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!prismaPost) return null;
    return PostMapper.toDomain(prismaPost);
  }

  async findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    authorId?: string,
    published?: boolean,
  ): Promise<PaginatedResult<Post>> {
    const { skip, orderBy } = getPaginationParams({ page, limit, sortBy, sortOrder });
    const where: Prisma.PostWhereInput = {
      deletedAt: null,
      ...(authorId && { authorId }),
      ...(published !== undefined && { published }),
    };

    const [prismaPosts, totalItems] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.post.count({ where }),
    ]);

    const posts = prismaPosts.map((p) => PostMapper.toDomain(p));
    return {
      items: posts,
      pagination: { page, limit, totalItems },
    };
  }

  async create(post: Post): Promise<Post> {
    const prismaPost = await this.prisma.post.create({
      data: {
        title: post.getTitle(),
        slug: post.getSlug(),
        content: post.getContent(),
        imageUrl: post.getImageUrl(),
        published: post.isPublished(),
        authorId: post.getAuthorId(),
      },
    });
    return PostMapper.toDomain(prismaPost);
  }

  async update(post: Post): Promise<Post> {
    const prismaPost = await this.prisma.post.update({
      where: { id: post.getId() },
      data: {
        title: post.getTitle(),
        slug: post.getSlug(),
        content: post.getContent(),
        imageUrl: post.getImageUrl(),
        published: post.isPublished(),
        publishedAt: post.getPublishedAt(),
      },
    });
    return PostMapper.toDomain(prismaPost);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
