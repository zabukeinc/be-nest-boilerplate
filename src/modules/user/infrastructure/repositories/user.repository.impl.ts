import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { PaginatedResult } from '@shared/pagination';
import { getPaginationParams } from '@shared/pagination';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<PaginatedResult<User>> {
    const { skip, orderBy } = getPaginationParams({ page, limit, sortBy, sortOrder });
    const where = { deletedAt: null };

    const [prismaUsers, totalItems] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.user.count({ where }),
    ]);

    const users = prismaUsers.map((u) => UserMapper.toDomain(u));
    return {
      items: users,
      pagination: { page, limit, totalItems },
    };
  }

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        role: user.getRole(),
      },
    });
    return UserMapper.toDomain(prismaUser);
  }

  async update(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        name: user.getName(),
        avatarUrl: user.getAvatarUrl(),
      },
    });
    return UserMapper.toDomain(prismaUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
